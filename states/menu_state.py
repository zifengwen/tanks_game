"""主菜单状态。"""
import os
import pygame

import config
from states.state import State
from utils.helpers import draw_text


class MenuState(State):
    """标题菜单。"""

    def __init__(self, game):
        super().__init__(game)
        self.title_font_size = 48
        self.sub_font_size = 20
        self.avatar = self._load_avatar()

    def _load_avatar(self):
        """加载并缩放首页头像图。"""
        path = os.path.join(config.BASE_DIR, "tank_avatar.png")
        try:
            image = pygame.image.load(path).convert_alpha()
        except (pygame.error, FileNotFoundError):
            return None
        return pygame.transform.scale(image, (120, 120))

    def handle_events(self, events):
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    self.game.change_state("play", level_index=1)
                elif event.key == pygame.K_ESCAPE:
                    self.game.running = False

    def update(self, dt):
        pass

    def draw(self, surface):
        surface.fill(config.COLOR_BLACK)
        draw_text(surface, "像素装甲闯关", self.title_font_size, config.COLOR_YELLOW,
                  config.SCREEN_WIDTH // 2, 100)
        if self.avatar:
            rect = self.avatar.get_rect(center=(config.SCREEN_WIDTH // 2, 220))
            surface.blit(self.avatar, rect)
        draw_text(surface, "按 Enter / Space 开始游戏", self.sub_font_size, config.COLOR_WHITE,
                  config.SCREEN_WIDTH // 2, 360)
        draw_text(surface, "方向键/WASD 移动  空格 射击", self.sub_font_size, config.COLOR_LIGHT_GREY,
                  config.SCREEN_WIDTH // 2, 395)
