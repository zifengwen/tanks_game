"""游戏状态基类。"""


class State:
    """单个游戏状态的抽象基类。"""

    def __init__(self, game):
        self.game = game

    def enter(self, **kwargs):
        """进入状态时调用。"""
        pass

    def exit(self):
        """离开状态时调用。"""
        pass

    def handle_events(self, events):
        """处理输入事件。"""
        pass

    def update(self, dt):
        """每帧逻辑更新。"""
        pass

    def draw(self, surface):
        """每帧绘制。"""
        pass
