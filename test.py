from ursina import *
import random

app = Ursina()

# Configuration fenêtre
window.title = 'Smooth 3D Shooting Game'
window.borderless = False
window.fullscreen = False

# Variables de jeu
level = 1
score = 0
health = 100
enemies = []
bullets = []
power_ups = []
game_state = "playing"
game_over_text = None

# Joueur
player = Entity(
    model='sphere',
    color=color.cyan,
    scale=0.8,
    position=(0, 0, -15),
    collider='sphere'
)

# Caméra
camera.position = (0, 5, -25)
camera.rotation_x = 15

# Interface utilisateur
score_text = Text(f'Score: {score}', position=(-0.8, 0.45), scale=2, color=color.white)
level_text = Text(f'Level: {level}', position=(-0.8, 0.4), scale=2, color=color.green)
health_text = Text(f'Health: {health}', position=(-0.8, 0.35), scale=2, color=color.red)

# Sol
ground = Entity(model='cube', color=color.dark_gray, scale=(50, 0.1, 50), position=(0, -5, 0))

def create_enemy():
    """Crée un ennemi avec difficulté basée sur le niveau"""
    enemy_types = ['sphere', 'cube']  # cylinder peut causer des erreurs
    enemy = Entity(
        model=random.choice(enemy_types),
        color=color.red,
        scale=random.uniform(0.8, 1.5),
        position=(
            random.uniform(-10, 10),
            random.uniform(0, 3),
            random.uniform(10, 20)
        ),
        collider='sphere'
    )
    # Vitesse augmente avec le niveau
    enemy.speed = random.uniform(0.02, 0.05) + (level * 0.01)
    enemy.health = level
    enemies.append(enemy)

def spawn_enemies():
    """Génère des ennemis pour le niveau actuel"""
    enemy_count = 3 + level * 2
    for _ in range(enemy_count):
        create_enemy()

def create_bullet():
    """Crée une balle"""
    bullet = Entity(
        model='sphere',
        color=color.yellow,
        scale=0.2,
        position=player.position + (0, 0, 1),
        collider='sphere'
    )
    bullets.append(bullet)

def create_power_up():
    """Crée un power-up occasionnel"""
    if random.random() < 0.1:  # 10% de chance
        power_up = Entity(
            model='cube',
            color=color.green,
            scale=0.5,
            position=(
                random.uniform(-8, 8),
                random.uniform(0, 2),
                random.uniform(5, 15)
            ),
            collider='box'
        )
        power_up.type = "health"  # Ajouter un type
        power_ups.append(power_up)

def update():
    global score, level, health, game_state, game_over_text
    
    if game_state != "playing":
        return
    
    # Contrôles joueur
    speed = 0.15
    if held_keys['a'] or held_keys['left']:
        player.x -= speed
    if held_keys['d'] or held_keys['right']:
        player.x += speed
    if held_keys['w'] or held_keys['up']:
        player.z += speed
    if held_keys['s'] or held_keys['down']:
        player.z -= speed
    
    # Limiter le joueur à l'écran
    player.x = max(-10, min(10, player.x))
    player.z = max(-20, min(-5, player.z))
    
    # Mouvement des balles avec copie de liste pour éviter les erreurs
    for bullet in bullets.copy():
        bullet.z += 0.8
        if bullet.z > 25:
            destroy(bullet)
            if bullet in bullets:
                bullets.remove(bullet)
    
    # Mouvement des ennemis
    for enemy in enemies.copy():
        enemy.z -= enemy.speed
        enemy.rotation_y += 1
        
        # Collision avec le joueur
        if distance(enemy, player) < 1.5:
            health -= 10
            destroy(enemy)
            if enemy in enemies:
                enemies.remove(enemy)
            
        # Ennemi qui dépasse
        elif enemy.z < -25:
            destroy(enemy)
            if enemy in enemies:
                enemies.remove(enemy)
    
    # Collisions balles/ennemis
    for bullet in bullets.copy():
        hit = False
        for enemy in enemies.copy():
            if distance(bullet, enemy) < 1:
                destroy(bullet)
                if bullet in bullets:
                    bullets.remove(bullet)
                enemy.health -= 1
                if enemy.health <= 0:
                    score += 10 * level
                    destroy(enemy)
                    if enemy in enemies:
                        enemies.remove(enemy)
                    create_power_up()
                hit = True
                break
        if hit:
            break
    
    # Gestion des power-ups
    for power_up in power_ups.copy():
        power_up.rotation_y += 2
        power_up.z -= 0.05
        
        if distance(power_up, player) < 1.5:
            if hasattr(power_up, 'type') and power_up.type == "health":
                health = min(100, health + 20)
            destroy(power_up)
            if power_up in power_ups:
                power_ups.remove(power_up)
        
        elif power_up.z < -25:
            destroy(power_up)
            if power_up in power_ups:
                power_ups.remove(power_up)
    
    # Niveau terminé
    if not enemies:
        level += 1
        spawn_enemies()
    
    # Game Over
    if health <= 0 and game_state == "playing":
        game_state = "game_over"
        if game_over_text:
            destroy(game_over_text)
        game_over_text = Text('GAME OVER\nPress R to restart', origin=(0,0), scale=3, color=color.red)
    
    # Mise à jour UI
    score_text.text = f'Score: {score}'
    level_text.text = f'Level: {level}'
    health_text.text = f'Health: {health}'

def input(key):
    global game_state, score, level, health, game_over_text
    
    if game_state == "playing":
        if key == 'space':
            create_bullet()
    
    elif game_state == "game_over":
        if key == 'r':
            # Restart
            game_state = "playing"
            score = 0
            level = 1
            health = 100
            
            # Nettoyer toutes les entités
            for entity_list in [enemies, bullets, power_ups]:
                for entity in entity_list.copy():
                    destroy(entity)
                entity_list.clear()
            
            if game_over_text:
                destroy(game_over_text)
                game_over_text = None
            
            player.position = (0, 0, -15)
            spawn_enemies()

# Éclairage
DirectionalLight(direction=(1, -1, 1), color=color.white)
AmbientLight(color=color.rgba(100, 100, 100, 0.1))

# Démarrer le jeu
spawn_enemies()
app.run()
