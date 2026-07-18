"""关卡加载与网格管理。"""
import os

import pygame

import config
from utils.helpers import grid_to_pixel
from world.tile import Brick, Steel, Water, Grass, Eagle


class Level:
    """关卡数据。"""

    def __init__(self, filename):
        self.filename = filename
        self.rows = []
        self.tiles = pygame.sprite.Group()
        self.solid_tiles = pygame.sprite.Group()
        self.bullet_block_tiles = pygame.sprite.Group()
        self.grass_tiles = pygame.sprite.Group()
        self.eagle = None
        self.player_spawn = None
        self.enemy_spawns = []
        self.enemy_count = config.ENEMY_COUNT_PER_LEVEL
        self.load()

    def load(self):
        """从文件加载关卡。"""
        path = os.path.join(config.LEVELS_DIR, self.filename)
        if not os.path.exists(path):
            raise FileNotFoundError("Level file not found: {}".format(path))
        with open(path, "r", encoding="utf-8") as f:
            self.rows = [line.rstrip("\n") for line in f if line.strip()]
        # 补齐到 13 行/列
        while len(self.rows) < config.GRID_ROWS:
            self.rows.append(config.SYM_EMPTY * config.GRID_COLS)
        self.rows = [row.ljust(config.GRID_COLS, config.SYM_EMPTY)[:config.GRID_COLS] for row in self.rows]
        self._build()

    def _build(self):
        """根据解析的字符网格创建瓦片。"""
        self.tiles.empty()
        self.solid_tiles.empty()
        self.bullet_block_tiles.empty()
        self.grass_tiles.empty()
        self.enemy_spawns = []
        for gy, row in enumerate(self.rows):
            for gx, ch in enumerate(row):
                x, y = grid_to_pixel(gx, gy)
                tile = None
                if ch == config.SYM_BRICK:
                    tile = Brick(x, y)
                elif ch == config.SYM_STEEL:
                    tile = Steel(x, y)
                elif ch == config.SYM_WATER:
                    tile = Water(x, y)
                elif ch == config.SYM_GRASS:
                    tile = Grass(x, y)
                elif ch == config.SYM_EAGLE:
                    tile = Eagle(x, y)
                    self.eagle = tile
                elif ch == config.SYM_PLAYER_SPAWN:
                    self.player_spawn = (x, y)
                elif ch in config.ENEMY_SPAWN_SYMBOLS:
                    self.enemy_spawns.append((x, y))
                if tile is not None:
                    self.tiles.add(tile)
                    if tile.solid:
                        self.solid_tiles.add(tile)
                    if tile.blocks_bullets:
                        self.bullet_block_tiles.add(tile)
                    if isinstance(tile, Grass):
                        self.grass_tiles.add(tile)
        if self.player_spawn is None:
            # 默认玩家出生点
            self.player_spawn = grid_to_pixel(config.GRID_COLS // 2, config.GRID_ROWS - 2)
        if not self.enemy_spawns:
            # 默认敌人出生点：左上、右上、中上
            self.enemy_spawns = [
                grid_to_pixel(0, 0),
                grid_to_pixel(config.GRID_COLS - 1, 0),
                grid_to_pixel(config.GRID_COLS // 2, 0),
            ]

    def collides_with_rect(self, rect):
        """矩形是否与固体瓦片碰撞。"""
        for tile in self.solid_tiles:
            if tile.rect.colliderect(rect):
                return True
        return False

    def tile_at(self, gx, gy):
        """获取指定网格坐标的瓦片（简单遍历）。"""
        if 0 <= gx < config.GRID_COLS and 0 <= gy < config.GRID_ROWS:
            for tile in self.tiles:
                if tile.gx == gx and tile.gy == gy:
                    return tile
        return None

    def is_eagle_alive(self):
        """基地是否还存活。"""
        return self.eagle is not None and self.eagle.alive

    def draw(self, surface):
        """绘制非草瓦片。"""
        for tile in self.tiles:
            if not isinstance(tile, Grass):
                tile.draw(surface)

    def draw_grass(self, surface):
        """绘制草丛（覆盖层）。"""
        for tile in self.grass_tiles:
            tile.draw(surface)
