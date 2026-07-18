"""地图瓦片。"""
import pygame

import config
from entities.base import Entity
from utils.helpers import load_image


class Tile(Entity):
    """地图瓦片基类。"""

    def __init__(self, x, y, image_name, color, solid=True, destructible=False, blocks_bullets=True):
        image = load_image(image_name, (config.TILE_SIZE, config.TILE_SIZE), color)
        super().__init__(x, y, image)
        self.solid = solid
        self.destructible = destructible
        self.blocks_bullets = blocks_bullets
        self.gx = x // config.TILE_SIZE
        self.gy = y // config.TILE_SIZE

    def take_damage(self):
        """被子弹命中。"""
        if self.destructible:
            self.kill()


class Brick(Tile):
    def __init__(self, x, y):
        super().__init__(x, y, "brick.png", config.COLOR_BROWN, solid=True, destructible=True, blocks_bullets=True)


class Steel(Tile):
    def __init__(self, x, y):
        super().__init__(x, y, "steel.png", config.COLOR_STEEL, solid=True, destructible=False, blocks_bullets=True)


class Water(Tile):
    def __init__(self, x, y):
        super().__init__(x, y, "water.png", config.COLOR_WATER, solid=True, destructible=False, blocks_bullets=False)


class Grass(Tile):
    def __init__(self, x, y):
        super().__init__(x, y, "grass.png", config.COLOR_GRASS, solid=False, destructible=False, blocks_bullets=False)


class Eagle(Tile):
    def __init__(self, x, y):
        super().__init__(x, y, "eagle.png", config.COLOR_YELLOW, solid=True, destructible=True, blocks_bullets=True)

    def take_damage(self):
        """基地被毁，触发游戏结束。"""
        self.kill()
        # 游戏结束标志由 PlayState 通过检测 Eagle 是否存活来处理
