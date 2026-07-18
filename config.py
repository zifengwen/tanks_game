"""全局配置常量。"""
import os

# ---------------------------------------------------------------------------
# 窗口与渲染
# ---------------------------------------------------------------------------
TILE_SIZE = 32
GRID_COLS = 13
GRID_ROWS = 13
MAP_WIDTH = TILE_SIZE * GRID_COLS      # 416
MAP_HEIGHT = TILE_SIZE * GRID_ROWS     # 416
HUD_HEIGHT = 64
SCREEN_WIDTH = MAP_WIDTH                 # 416
SCREEN_HEIGHT = MAP_HEIGHT + HUD_HEIGHT  # 480
FPS = 60
CAPTION = "像素装甲闯关"

# ---------------------------------------------------------------------------
# 颜色
# ---------------------------------------------------------------------------
COLOR_BLACK = (0, 0, 0)
COLOR_WHITE = (255, 255, 255)
COLOR_GREY = (128, 128, 128)
COLOR_DARK_GREY = (64, 64, 64)
COLOR_LIGHT_GREY = (192, 192, 192)
COLOR_RED = (255, 0, 0)
COLOR_GREEN = (0, 255, 0)
COLOR_BLUE = (0, 0, 255)
COLOR_YELLOW = (255, 255, 0)
COLOR_ORANGE = (255, 165, 0)
COLOR_BROWN = (139, 69, 19)
COLOR_STEEL = (169, 169, 169)
COLOR_WATER = (65, 105, 225)
COLOR_GRASS = (34, 139, 34)

# ---------------------------------------------------------------------------
# 方向
# ---------------------------------------------------------------------------
DIR_UP = 0
DIR_RIGHT = 1
DIR_DOWN = 2
DIR_LEFT = 3

DIRECTION_VECTORS = {
    DIR_UP: (0, -1),
    DIR_RIGHT: (1, 0),
    DIR_DOWN: (0, 1),
    DIR_LEFT: (-1, 0),
}

# ---------------------------------------------------------------------------
# 游戏数值
# ---------------------------------------------------------------------------
PLAYER_SPEED = 120          # 像素/秒
ENEMY_SPEED = 80            # 像素/秒
BULLET_SPEED = 320          # 像素/秒
PLAYER_SHOOT_COOLDOWN = 0.4 # 秒
ENEMY_SHOOT_COOLDOWN = 2.0  # 秒
ENEMY_CHANGE_DIR_TIME = 1.5 # 秒
PLAYER_LIVES = 3
ENEMY_COUNT_PER_LEVEL = 20
MAX_ENEMIES_ON_SCREEN = 4
ENEMY_SPAWN_INTERVAL = 3.0  # 秒
PLAYER_RESPAWN_TIME = 1.5   # 秒
PLAYER_INVINCIBLE_TIME = 2.0 # 秒

# ---------------------------------------------------------------------------
# 资源路径
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
IMAGES_DIR = os.path.join(ASSETS_DIR, "images")
SOUNDS_DIR = os.path.join(ASSETS_DIR, "sounds")
FONTS_DIR = os.path.join(ASSETS_DIR, "fonts")
LEVELS_DIR = os.path.join(BASE_DIR, "levels")

# ---------------------------------------------------------------------------
# 关卡符号
# ---------------------------------------------------------------------------
SYM_EMPTY = "."
SYM_BRICK = "#"
SYM_STEEL = "@"
SYM_WATER = "~"
SYM_GRASS = "*"
SYM_EAGLE = "E"
SYM_PLAYER_SPAWN = "P"
SYM_ENEMY_SPAWN = "1"

# 兼容额外敌人出生点标记
ENEMY_SPAWN_SYMBOLS = {"1", "2", "3"}
