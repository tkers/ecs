
window.addEventListener('load', () => {
  const game = ECS.createGame(document.getElementById('cvs'))

  const gameLoop = () => {
    game.update()
    requestAnimationFrame(gameLoop)
  }

  gameLoop()
})
