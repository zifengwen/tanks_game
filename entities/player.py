"""玩家坦克。"""
import pygame

import config
from entities.tank import Tank
from utils.helpers import load_image


class PlayerTank(Tank):
    """由玩家控制的坦克。"""

    def __init__(self, x, y):
        super().__init__(x, y, "player_tank.png", config.PLAYER_SPEED, config.PLAYER_SHOOT_COOLDOWN)
        self.lives = config.PLAYER_LIVES
        self.invincible_timer = 0.0
        self.respawn_timer = 0.0
        self.spawn_pos = (x, y)
        self._blink_timer = 0.0
        self._visible = True

    def handle_input(self, keys):
        """处理键盘输入。"""
        if self.respawn_timer > 0:
            return
        moved = False
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.set_direction(config.DIR_UP)
            moved = True
        elif keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.set_direction(config.DIR_DOWN)
            moved = True
        elif keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.set_direction(config.DIR_LEFT)
            moved = True
        elif keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.set_direction(config.DIR_RIGHT)
            moved = True
        self.moving = moved

    def update(self, dt, level, enemies):
        """更新玩家状态。"""
        super().update(dt)
        if self.respawn_timer > 0:
            self.respawn_timer -= dt
            if self.respawn_timer <= 0:
                self.respawn(self.spawn_pos[0], self.spawn_pos[1])
            return
        if self.invincible_timer > 0:
            self.invincible_timer -= dt
            self._blink_timer += dt
            if self._blink_timer >= 0.1:
                self._blink_timer = 0.0
                self._visible = not self._visible
        else:
            self._visible = True
        if self.moving:
            # 玩家可以穿过敌人坦克，但接触时会受伤（在 PlayState 中处理）
            self.try_move(dt, level, [])

    def draw(self, surface):
        if not self._visible:
            return
        super().draw(surface)

    def shoot(self):
        """玩家射击。"""
        if self.respawn_timer > 0:
            return None
        return super().shoot("player")

    def take_damage(self):
        """玩家受击：扣生命并进入复活。"""
        if self.respawn_timer > 0 or self.invincible_timer > 0:
            return
        self.lives -= 1
        if self.lives > 0:
            self.respawn_timer = config.PLAYER_RESPAWN_TIME
            self.invincible_timer = 0.0
            self._visible = False
        else:
            self.kill()

    def respawn(self, x, y):
        """复活。"""
        super().respawn(x, y)
        self.invincible_timer = config.PLAYER_INVINCIBLE_TIME
        self._visible = True
        self._blink_timer = 0.0

    def is_dead(self):
        """生命耗尽且未在复活中。"""
        return self.lives <= 0 and self.respawn_timer <= 0
