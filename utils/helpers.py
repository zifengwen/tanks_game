"""通用工具函数。"""
import os
import pygame

import config


def grid_to_pixel(gx, gy):
    """网格坐标转换为像素坐标（左上角）。"""
    return gx * config.TILE_SIZE, gy * config.TILE_SIZE


def pixel_to_grid(px, py):
    """像素坐标转换为网格坐标。"""
    return px // config.TILE_SIZE, py // config.TILE_SIZE


def load_image(name, size=None, fallback_color=None):
    """加载图片；若不存在则创建纯色占位图。"""
    path = os.path.join(config.IMAGES_DIR, name)
    try:
        image = pygame.image.load(path).convert_alpha()
    except (pygame.error, FileNotFoundError):
        image = make_fallback_surface(size or (config.TILE_SIZE, config.TILE_SIZE), fallback_color)
    else:
        if size is not None:
            image = pygame.transform.scale(image, size)
    return image


def make_fallback_surface(size, color):
    """创建指定尺寸的纯色 Surface。"""
    if color is None:
        color = config.COLOR_GREY
    surface = pygame.Surface(size, pygame.SRCALPHA)
    surface.fill(color)
    return surface


def make_pixel_image(size, pixel_map, color_map, scale=1):
    """根据像素矩阵和颜色映射生成像素风图片，并可选放大。

    pixel_map: 字符串列表，每个字符对应 color_map 中的一种颜色。
    color_map: 字符 -> RGB/RGBA 的映射。
    scale: 最终缩放倍数。
    """
    rows = len(pixel_map)
    cols = len(pixel_map[0]) if rows else 0
    surf = pygame.Surface((cols, rows), pygame.SRCALPHA)
    for y, row in enumerate(pixel_map):
        for x, ch in enumerate(row):
            if ch in color_map:
                surf.set_at((x, y), color_map[ch])
    if scale != 1:
        surf = pygame.transform.scale(surf, (cols * scale, rows * scale))
    return surf


def create_default_assets():
    """生成默认像素素材到 assets/images/，避免没有图片时游戏无法启动。"""
    if not os.path.isdir(config.IMAGES_DIR):
        os.makedirs(config.IMAGES_DIR)

    # 坦克色板
    tc = {
        ".": (0, 0, 0, 0),
        "B": config.COLOR_BLACK,
        "Y": config.COLOR_YELLOW,
        "G": config.COLOR_GREEN,
        "R": config.COLOR_RED,
        "W": config.COLOR_WHITE,
        "S": config.COLOR_STEEL,
    }

    ts = config.TILE_SIZE
    half = ts // 2

    # 玩家坦克（黄色主体，白色履带）
    player_body = [
        "BBBBBBBB",
        "BWWBBWWB",
        "BWWBBWWB",
        "BBBBYBBB",
        "BYYYYYYB",
        "BYYYYYYB",
        "BBBBYBBB",
        "BWWBBWWB",
        "BWWBBWWB",
        "BBBBBBBB",
    ]
    # 居中并缩放到 TILE_SIZE
    player = make_pixel_image((10, 10), player_body, tc, 1)
    player = pygame.transform.scale(player, (ts, ts))

    # 敌人坦克（红色主体）
    enemy_body = [
        "BBBBBBBB",
        "BWWBBWWB",
        "BWWBBWWB",
        "BBBBRBBB",
        "BRRRRRRB",
        "BRRRRRRB",
        "BBBBRBBB",
        "BWWBBWWB",
        "BWWBBWWB",
        "BBBBBBBB",
    ]
    enemy = make_pixel_image((10, 10), enemy_body, tc, 1)
    enemy = pygame.transform.scale(enemy, (ts, ts))

    # 子弹
    bullet_body = [["W"]]
    bullet = make_pixel_image((1, 1), bullet_body, tc, 1)
    bullet = pygame.transform.scale(bullet, (ts // 4, ts // 4))

    # 砖块
    brick_body = [
        "BBBBBBBB",
        "BRRBRRRB",
        "BRRBRRRB",
        "BBBBBBBB",
        "BRRBRRRB",
        "BRRBRRRB",
        "BBBBBBBB",
        "BRRBRRRB",
    ]
    brick = make_pixel_image((8, 8), brick_body, tc, 1)
    brick = pygame.transform.scale(brick, (ts, ts))

    # 钢块
    steel_body = [
        "SSSSSSSS",
        "SWWSSWWS",
        "SWWSSWWS",
        "SSSSSSSS",
        "SWWSSWWS",
        "SWWSSWWS",
        "SSSSSSSS",
        "SWWSSWWS",
    ]
    steel = make_pixel_image((8, 8), steel_body, tc, 1)
    steel = pygame.transform.scale(steel, (ts, ts))

    # 水
    water_body = [["B"]]
    water = make_pixel_image((1, 1), water_body, {"B": config.COLOR_WATER}, 1)
    water = pygame.transform.scale(water, (ts, ts))

    # 草
    grass_body = [["G"]]
    grass = make_pixel_image((1, 1), grass_body, {"G": config.COLOR_GRASS}, 1)
    grass = pygame.transform.scale(grass, (ts, ts))

    # 基地（鹰）
    eagle_body = [
        "....BB....",
        "...BWWB...",
        "..BWYYWB..",
        ".BWYYYYWB.",
        "BWYYYYYYWB",
        "BWYYYYYYWB",
        ".BWYYYYWB.",
        "..BWYYWB..",
        "...BWWB...",
        "....BB....",
    ]
    ec = {
        ".": (0, 0, 0, 0),
        "B": config.COLOR_BLACK,
        "W": config.COLOR_WHITE,
        "Y": config.COLOR_YELLOW,
    }
    eagle = make_pixel_image((10, 10), eagle_body, ec, 1)
    eagle = pygame.transform.scale(eagle, (ts, ts))

    # 爆炸效果
    explode_body = [
        "...YY...",
        ".YYRRYY.",
        "YRRWRRYY",
        "YRWWRWRY",
        "YRRWRRRY",
        ".YYRRYY.",
        "..YYYY..",
    ]
    explode = make_pixel_image((8, 7), explode_body, tc, 1)
    explode = pygame.transform.scale(explode, (ts, ts))

    assets = {
        "player_tank.png": player,
        "enemy_tank.png": enemy,
        "bullet.png": bullet,
        "brick.png": brick,
        "steel.png": steel,
        "water.png": water,
        "grass.png": grass,
        "eagle.png": eagle,
        "explosion.png": explode,
    }

    for filename, surf in assets.items():
        full = os.path.join(config.IMAGES_DIR, filename)
        if not os.path.exists(full):
            pygame.image.save(surf, full)


def draw_text(surface, text, size, color, x, y, center=True, font_name=None):
    """在 surface 上绘制文字。"""
    if font_name is None:
        font = pygame.font.SysFont("simhei", size)
    else:
        font = pygame.font.Font(font_name, size)
    rendered = font.render(text, True, color)
    rect = rendered.get_rect()
    if center:
        rect.center = (x, y)
    else:
        rect.topleft = (x, y)
    surface.blit(rendered, rect)
    return rect
