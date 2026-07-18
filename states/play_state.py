"""游戏主状态。"""
import os
import random

import pygame

import config
from entities.player import PlayerTank
from entities.enemy import EnemyTank
from states.state import State
from utils.helpers import draw_text
from world.level import Level
from world.tile import Eagle


class PlayState(State):
    """实际游戏状态。"""

    def __init__(self, game):
        super().__init__(game)
        self.level = None
        self.level_index = 1
        self.player = None
        self.enemies = pygame.sprite.Group()
        self.bullets = pygame.sprite.Group()
        self.explosions = pygame.sprite.Group()
        self.score = 0
        self.enemy_remaining = 0
        self.enemy_spawn_timer = 0.0
        self.enemy_spawn_index = 0
        self.state_font = None

    def enter(self, **kwargs):
        self.level_index = kwargs.get("level_index", 1)
        self.score = kwargs.get("score", 0)
        self._load_level(self.level_index)

    def _level_file(self, index):
        return os.path.join(config.LEVELS_DIR, "level_{:02d}.txt".format(index))

    def _load_level(self, index):
        filename = "level_{:02d}.txt".format(index)
        if not os.path.exists(os.path.join(config.LEVELS_DIR, filename)):
            # 没有更多关卡，视为通关
            self.game.change_state("victory", score=self.score, level_index=index - 1, has_next=False)
            return
        self.level = Level(filename)
        self.player = PlayerTank(self.level.player_spawn[0], self.level.player_spawn[1])
        self.enemies.empty()
        self.bullets.empty()
        self.explosions.empty()
        self.enemy_remaining = self.level.enemy_count
        self.enemy_spawn_timer = 0.0
        self.enemy_spawn_index = 0

    def handle_events(self, events):
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.game.change_state("menu")

    def update(self, dt):
        if self.level is None or self.player is None:
            return

        # 输入
        keys = pygame.key.get_pressed()
        self.player.handle_input(keys)
        if keys[pygame.K_SPACE]:
            bullet = self.player.shoot()
            if bullet:
                self.bullets.add(bullet)

        # 更新玩家
        self.player.update(dt, self.level, self.enemies)

        # 生成敌人
        self._spawn_enemies(dt)

        # 更新敌人
        all_enemy_sprites = list(self.enemies)
        for enemy in all_enemy_sprites:
            bullet = enemy.update(dt, self.level, self.player, all_enemy_sprites)
            if bullet:
                self.bullets.add(bullet)

        # 更新子弹
        self.bullets.update(dt)

        # 更新爆炸效果
        self.explosions.update(dt)

        # 碰撞处理
        self._handle_collisions()

        # 胜负判定
        self._check_end_conditions()

    def _spawn_enemies(self, dt):
        if self.enemy_remaining <= 0:
            return
        if len(self.enemies) >= config.MAX_ENEMIES_ON_SCREEN:
            return
        self.enemy_spawn_timer -= dt
        if self.enemy_spawn_timer <= 0:
            self.enemy_spawn_timer = config.ENEMY_SPAWN_INTERVAL
            spawn_pos = random.choice(self.level.enemy_spawns)
            enemy = EnemyTank(spawn_pos[0], spawn_pos[1])
            self.enemies.add(enemy)
            self.enemy_remaining -= 1

    def _handle_collisions(self):
        # 子弹 vs 瓦片
        for bullet in list(self.bullets):
            hit_tiles = pygame.sprite.spritecollide(bullet, self.level.bullet_block_tiles, False)
            for tile in hit_tiles:
                # 同方向穿墙？不需要，直接处理
                if isinstance(tile, Eagle):
                    # 基地被任意子弹击中都游戏结束
                    tile.take_damage()
                    bullet.kill()
                    self._add_explosion(tile.rect.center)
                    break
                elif tile.destructible:
                    tile.take_damage()
                    bullet.kill()
                    self._add_explosion(tile.rect.center)
                    break
                else:
                    bullet.kill()
                    break

        # 子弹 vs 坦克
        for bullet in list(self.bullets):
            if bullet.owner == "player":
                hit_enemies = pygame.sprite.spritecollide(bullet, self.enemies, False)
                for enemy in hit_enemies:
                    enemy.take_damage()
                    bullet.kill()
                    self.score += 100
                    self._add_explosion(enemy.rect.center)
                    break
            elif bullet.owner == "enemy":
                if self.player.alive and self.player.rect.colliderect(bullet.rect):
                    if self.player.respawn_timer <= 0 and self.player.invincible_timer <= 0:
                        self.player.take_damage()
                        bullet.kill()
                        self._add_explosion(self.player.rect.center)

        # 子弹 vs 子弹
        bullets_list = list(self.bullets)
        for i, b1 in enumerate(bullets_list):
            for b2 in bullets_list[i + 1:]:
                if b1.rect.colliderect(b2.rect):
                    if b1.owner != b2.owner:
                        b1.kill()
                        b2.kill()

        # 玩家 vs 敌人坦克（碰撞即受伤）
        if self.player.alive and self.player.respawn_timer <= 0 and self.player.invincible_timer <= 0:
            for enemy in self.enemies:
                if enemy.alive and self.player.rect.colliderect(enemy.rect):
                    self.player.take_damage()
                    self._add_explosion(self.player.rect.center)
                    break

    def _add_explosion(self, center):
        from utils.helpers import load_image
        image = load_image("explosion.png", (config.TILE_SIZE, config.TILE_SIZE), config.COLOR_ORANGE)
        sprite = pygame.sprite.Sprite()
        sprite.image = image
        sprite.rect = sprite.image.get_rect(center=center)
        sprite.lifetime = 0.3
        sprite.update = lambda dt: self._explosion_update(sprite, dt)
        self.explosions.add(sprite)

    def _explosion_update(self, sprite, dt):
        sprite.lifetime -= dt
        if sprite.lifetime <= 0:
            sprite.kill()

    def _check_end_conditions(self):
        if not self.level.is_eagle_alive():
            self.game.change_state("game_over", score=self.score, level_index=self.level_index)
            return
        if self.player.is_dead():
            self.game.change_state("game_over", score=self.score, level_index=self.level_index)
            return
        if self.enemy_remaining <= 0 and len(self.enemies) == 0:
            self.game.change_state("victory", score=self.score, level_index=self.level_index, has_next=True)
            return

    def draw(self, surface):
        # 背景
        surface.fill(config.COLOR_BLACK)
        # 地图
        if self.level:
            self.level.draw(surface)
        # 玩家
        if self.player:
            self.player.draw(surface)
        # 敌人
        for enemy in self.enemies:
            enemy.draw(surface)
        # 子弹
        for bullet in self.bullets:
            bullet.draw(surface)
        # 爆炸
        for exp in self.explosions:
            surface.blit(exp.image, exp.rect)
        # 草地覆盖
        if self.level:
            self.level.draw_grass(surface)
        # HUD
        self._draw_hud(surface)

    def _draw_hud(self, surface):
        hud_y = config.MAP_HEIGHT
        pygame.draw.rect(surface, config.COLOR_DARK_GREY, (0, hud_y, config.SCREEN_WIDTH, config.HUD_HEIGHT))
        draw_text(surface, "关卡 {}".format(self.level_index), 18, config.COLOR_WHITE,
                  10, hud_y + config.HUD_HEIGHT // 2, center=False)
        draw_text(surface, "得分 {}".format(self.score), 18, config.COLOR_YELLOW,
                  110, hud_y + config.HUD_HEIGHT // 2, center=False)
        draw_text(surface, "生命 {}".format(self.player.lives if self.player else 0), 18, config.COLOR_GREEN,
                  230, hud_y + config.HUD_HEIGHT // 2, center=False)
        draw_text(surface, "剩余敌人 {}".format(self.enemy_remaining + len(self.enemies)), 18, config.COLOR_RED,
                  320, hud_y + config.HUD_HEIGHT // 2, center=False)
