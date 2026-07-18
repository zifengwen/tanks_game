"""简短冒烟测试：初始化游戏并跑几帧。"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from game import Game
import pygame


def main():
    game = Game()
    # 切到 play 状态
    game.change_state("play", level_index=1)
    # 跑 10 帧
    for _ in range(10):
        dt = 1 / 60.0
        events = []
        game.current_state.handle_events(events)
        game.current_state.update(dt)
        game.current_state.draw(game.screen)
    print("SMOKE_TEST_OK")
    pygame.quit()


if __name__ == "__main__":
    main()
