"""胜利/过关状态。"""
import pygame

import config
from states.state import State
from utils.helpers import draw_text


class VictoryState(State):
    """过关或全通关画面。"""

    def __init__(self, game):
        super().__init__(game)

    def enter(self, **kwargs):
        self.score = kwargs.get("score", 0)
        self.level_index = kwargs.get("level_index", 1)
        self.has_next = kwargs.get("has_next", True)

    def handle_events(self, events):
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    if self.has_next:
                        self.game.change_state("play", level_index=self.level_index + 1)
                    else:
                        self.game.change_state("menu")
                elif event.key == pygame.K_ESCAPE:
                    self.game.running = False

    def update(self, dt):
        pass

    def draw(self, surface):
        overlay = pygame.Surface((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        overlay.fill(config.COLOR_BLACK)
        overlay.set_alpha(180)
        surface.blit(overlay, (0, 0))
        draw_text(surface, "VICTORY", 48, config.COLOR_GREEN,
                  config.SCREEN_WIDTH // 2, config.SCREEN_HEIGHT // 3)
        draw_text(surface, "关卡完成", 32, config.COLOR_WHITE,
                  config.SCREEN_WIDTH // 2, config.SCREEN_HEIGHT // 2)
        draw_text(surface, "得分: {}".format(self.score), 22, config.COLOR_YELLOW,
                  config.SCREEN_WIDTH // 2, config.SCREEN_HEIGHT // 2 + 45)
        if self.has_next:
            draw_text(surface, "按 Enter 进入下一关", 20, config.COLOR_LIGHT_GREY,
                      config.SCREEN_WIDTH // 2, config.SCREEN_HEIGHT * 2 // 3 + 40)
        else:
            draw_text(surface, "恭喜通关！按 Enter 返回菜单", 20, config.COLOR_LIGHT_GREY,
                      config.SCREEN_WIDTH // 2, config.SCREEN_HEIGHT * 2 // 3 + 40)
