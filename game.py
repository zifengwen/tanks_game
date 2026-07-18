"""游戏主类。"""
import pygame

import config
from states.menu_state import MenuState
from states.play_state import PlayState
from states.game_over_state import GameOverState
from states.victory_state import VictoryState
from utils.helpers import create_default_assets


class Game:
    """管理 Pygame 初始化、主循环与状态切换。"""

    def __init__(self):
        pygame.init()
        pygame.display.set_caption(config.CAPTION)
        self.screen = pygame.display.set_mode((config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        self.clock = pygame.time.Clock()
        self.running = True

        # 确保默认素材存在
        create_default_assets()

        # 注册状态
        self.states = {
            "menu": MenuState(self),
            "play": PlayState(self),
            "game_over": GameOverState(self),
            "victory": VictoryState(self),
        }
        self.current_state = self.states["menu"]
        self.current_state.enter()

    def change_state(self, name, **kwargs):
        """切换到指定状态。"""
        self.current_state.exit()
        self.current_state = self.states[name]
        self.current_state.enter(**kwargs)

    def run(self):
        """主循环。"""
        while self.running:
            dt = self.clock.tick(config.FPS) / 1000.0
            events = pygame.event.get()
            for event in events:
                if event.type == pygame.QUIT:
                    self.running = False

            self.current_state.handle_events(events)
            self.current_state.update(dt)
            self.current_state.draw(self.screen)
            pygame.display.flip()

        pygame.quit()


if __name__ == "__main__":
    Game().run()
