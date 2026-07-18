"""坦克基类。"""
import pygame

import config
from entities.base import Entity
from entities.bullet import Bullet
from utils.helpers import load_image


class Tank(Entity):
    """玩家与敌人坦克的公共基类。"""

    def __init__(self, x, y, image_name, speed, shoot_cooldown):
        image = load_image(image_name, (config.TILE_SIZE, config.TILE_SIZE))
        super().__init__(x, y, image)
        self.direction = config.DIR_UP
        self.speed = speed
        self.shoot_cooldown = shoot_cooldown
        self.shoot_timer = 0.0
        self.active_bullet = None
        self.moving = False
        self._base_image = self.image

    def set_direction(self, direction):
        """设置坦克朝向并旋转图片。"""
        if self.direction == direction:
            return
        self.direction = direction
        angle = direction * 90
        center = self.rect.center
        self.image = pygame.transform.rotate(self._base_image, -angle)
        self.rect = self.image.get_rect(center=center)

    def can_move(self, dx, dy, level, other_tanks=None):
        """检查坦克是否可以沿指定增量移动。"""
        new_rect = self.rect.move(dx, dy)
        # 边界检查
        if new_rect.left < 0 or new_rect.right > config.MAP_WIDTH:
            return False
        if new_rect.top < 0 or new_rect.bottom > config.MAP_HEIGHT:
            return False
        # 瓦片碰撞
        if level.collides_with_rect(new_rect):
            return False
        # 与其他坦克碰撞
        if other_tanks:
            for tank in other_tanks:
                if tank is not self and tank.alive and new_rect.colliderect(tank.rect):
                    return False
        return True

    def try_move(self, dt, level, other_tanks=None):
        """尝试按当前方向移动。"""
        vx, vy = config.DIRECTION_VECTORS[self.direction]
        dx = vx * self.speed * dt
        dy = vy * self.speed * dt
        # 先按原始方向移动；如果不行，尝试分别沿 x/y 轴滑动
        if self.can_move(dx, dy, level, other_tanks):
            self.rect.x += dx
            self.rect.y += dy
            return True
        if dx != 0 and self.can_move(dx, 0, level, other_tanks):
            self.rect.x += dx
            return True
        if dy != 0 and self.can_move(0, dy, level, other_tanks):
            self.rect.y += dy
            return True
        return False

    def shoot(self, owner):
        """发射子弹。"""
        if self.shoot_timer > 0:
            return None
        if self.active_bullet is not None and self.active_bullet.alive:
            return None
        self.shoot_timer = self.shoot_cooldown
        vx, vy = config.DIRECTION_VECTORS[self.direction]
        cx, cy = self.rect.center
        bullet_size = config.TILE_SIZE // 4
        # 子弹从坦克炮口射出，初始位置在坦克外边缘外 2 像素，避免自碰撞
        offset = config.TILE_SIZE // 2 + bullet_size // 2 + 2
        bullet_x = cx - bullet_size // 2 + vx * offset
        bullet_y = cy - bullet_size // 2 + vy * offset
        bullet = Bullet(bullet_x, bullet_y, self.direction, owner, self)
        self.active_bullet = bullet
        return bullet

    def update(self, dt):
        """更新射击冷却。"""
        if self.shoot_timer > 0:
            self.shoot_timer = max(0.0, self.shoot_timer - dt)
        if self.active_bullet is not None and not self.active_bullet.alive:
            self.active_bullet = None

    def take_damage(self):
        """受击处理，子类重写。"""
        self.kill()

    def respawn(self, x, y):
        """复活/重置位置。"""
        self.rect.topleft = (x, y)
        self.direction = config.DIR_UP
        self.image = self._base_image
        self.alive = True
        self.shoot_timer = 0.0
        self.active_bullet = None
