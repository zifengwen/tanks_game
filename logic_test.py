"""核心逻辑测试。"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pygame
import config
from entities.player import PlayerTank
from entities.enemy import EnemyTank
from entities.bullet import Bullet
from world.level import Level
from world.tile import Eagle


def setup():
    pygame.init()
    from utils.helpers import create_default_assets
    create_default_assets()


def test_level_load():
    level = Level("level_01.txt")
    assert level is not None
    assert level.is_eagle_alive()
    assert level.player_spawn is not None
    assert len(level.enemy_spawns) > 0
    print("test_level_load OK")


def test_player_movement_and_collision():
    level = Level("level_01.txt")
    player = PlayerTank(level.player_spawn[0], level.player_spawn[1])
    # 向上移动，检查不会穿墙
    player.set_direction(config.DIR_UP)
    for _ in range(10):
        player.try_move(1 / 60.0, level, [])
    assert player.rect.top >= 0
    print("test_player_movement_and_collision OK")


def test_bullet_destroy_brick():
    level = Level("level_01.txt")
    # 找到砖块
    brick = None
    for tile in level.tiles:
        if tile.destructible and not isinstance(tile, Eagle):
            brick = tile
            break
    assert brick is not None
    # 从砖块下方朝上发射子弹，直接移动到砖块位置
    bullet = Bullet(brick.rect.centerx, brick.rect.bottom + 10, config.DIR_UP, "player", None)
    bullet.rect.center = brick.rect.center
    # 手动触发碰撞
    hit = False
    for tile in level.bullet_block_tiles:
        if bullet.rect.colliderect(tile.rect):
            if isinstance(tile, Eagle):
                tile.take_damage()
                bullet.kill()
                hit = True
                break
            elif tile.destructible:
                tile.take_damage()
                bullet.kill()
                hit = True
                break
    assert hit
    assert not brick.alive
    print("test_bullet_destroy_brick OK")


def test_enemy_damage():
    level = Level("level_01.txt")
    enemy = EnemyTank(100, 100)
    enemy.take_damage()
    assert not enemy.alive
    print("test_enemy_damage OK")


def test_player_damage_and_respawn():
    level = Level("level_01.txt")
    player = PlayerTank(level.player_spawn[0], level.player_spawn[1])
    player.take_damage()
    assert player.lives == config.PLAYER_LIVES - 1
    assert player.respawn_timer > 0
    # 模拟复活
    player.respawn_timer = 0.01
    player.update(0.1, level, [])
    assert player.invincible_timer > 0
    print("test_player_damage_and_respawn OK")


def test_player_enemy_collision_damage():
    level = Level("level_01.txt")
    player = PlayerTank(level.player_spawn[0], level.player_spawn[1])
    enemy = EnemyTank(player.rect.x, player.rect.y)
    # 模拟 PlayState 中的碰撞检测逻辑
    if player.alive and player.respawn_timer <= 0 and player.invincible_timer <= 0:
        if enemy.alive and player.rect.colliderect(enemy.rect):
            player.take_damage()
    assert player.lives == config.PLAYER_LIVES - 1
    assert player.respawn_timer > 0
    print("test_player_enemy_collision_damage OK")


def main():
    setup()
    test_level_load()
    test_player_movement_and_collision()
    test_bullet_destroy_brick()
    test_enemy_damage()
    test_player_damage_and_respawn()
    test_player_enemy_collision_damage()
    print("ALL_TESTS_OK")
    pygame.quit()


if __name__ == "__main__":
    main()
