"""游戏实体基类。"""
import pygame


class Entity(pygame.sprite.Sprite):
    """所有游戏对象的公共基类。"""

    def __init__(self, x, y, image):
        super().__init__()
        self.image = image
        self.rect = self.image.get_rect(topleft=(x, y))
        self.alive = True

    def update(self, dt):
        """每帧更新。"""
        pass

    def draw(self, surface):
        """绘制到 surface。"""
        surface.blit(self.image, self.rect)

    def kill(self):
        """标记销毁。"""
        self.alive = False
        super().kill()
