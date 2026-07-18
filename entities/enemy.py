"""敌人坦克。"""
import random

import pygame

import config
from entities.tank import Tank
from utils.helpers import load_image


class EnemyTank(Tank):
    """由 AI 控制的敌方坦克。"""

    def __init__(self, x, y):
        super().__init__(x, y, "enemy_tank.png", config.ENEMY_SPEED, config.ENEMY_SHOOT_COOLDOWN)
        self.change_dir_timer = random.uniform(0.5, config.ENEMY_CHANGE_DIR_TIME)
        self.shoot_timer = random.uniform(0.5, config.ENEMY_SHOOT_COOLDOWN)
        self._ai_timer = 0.0

    def pick_direction(self, level, player):
        """随机选择一个可行方向。"""
        directions = [config.DIR_UP, config.DIR_RIGHT, config.DIR_DOWN, config.DIR_LEFT]
        random.shuffle(directions)
        # 优先朝玩家方向
        if player and player.alive:
            px, py = player.rect.center
            cx, cy = self.rect.center
            if abs(px - cx) > abs(py - cy):
                preferred = config.DIR_RIGHT if px > cx else config.DIR_LEFT
            else:
                preferred = config.DIR_DOWN if py > cy else config.DIR_UP
            if preferred in directions:
                directions.remove(preferred)
                directions.insert(0, preferred)
        for direction in directions:
            self.set_direction(direction)
            vx, vy = config.DIRECTION_VECTORS[direction]
            # 检查一小段距离是否可移动
            if self.can_move(vx * 8, vy * 8, level):
                return direction
        return self.direction

    def update(self, dt, level, player, all_enemies):
        """更新敌人 AI。"""
        super().update(dt)
        self._ai_timer += dt
        self.change_dir_timer -= dt
        self.shoot_timer -= dt

        # 转向/移动
        if self.change_dir_timer <= 0:
            self.pick_direction(level, player)
            self.change_dir_timer = random.uniform(0.8, config.ENEMY_CHANGE_DIR_TIME)

        # 移动；若撞墙则重新选方向
        if not self.try_move(dt, level, all_enemies):
            self.pick_direction(level, player)
            self.change_dir_timer = random.uniform(0.5, config.ENEMY_CHANGE_DIR_TIME)

        # 射击
        if self.shoot_timer <= 0:
            self.shoot_timer = random.uniform(1.0, config.ENEMY_SHOOT_COOLDOWN)
            return super().shoot("enemy")
        return None

    def take_damage(self):
        """敌人受击：直接销毁。"""
        self.kill()
