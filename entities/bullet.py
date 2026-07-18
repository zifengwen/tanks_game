"""子弹类。"""
import pygame

import config
from entities.base import Entity
from utils.helpers import load_image


class Bullet(Entity):
    """坦克发射的子弹。"""

    def __init__(self, x, y, direction, owner, owner_tank):
        size = config.TILE_SIZE // 4
        image = load_image("bullet.png", (size, size), config.COLOR_WHITE)
        super().__init__(x, y, image)
        self.direction = direction
        self.owner = owner          # "player" 或 "enemy"
        self.owner_tank = owner_tank
        self.speed = config.BULLET_SPEED
        vx, vy = config.DIRECTION_VECTORS[direction]
        self.vx = vx * self.speed
        self.vy = vy * self.speed

    def update(self, dt):
        self.rect.x += self.vx * dt
        self.rect.y += self.vy * dt
        # 出界销毁
        if (self.rect.right < 0 or self.rect.left > config.MAP_WIDTH or
                self.rect.bottom < 0 or self.rect.top > config.MAP_HEIGHT):
            self.kill()

    def should_hit(self, other_owner):
        """判断是否能命中对方子弹/坦克：不能命中同所有者对象。"""
        return self.owner != other_owner
