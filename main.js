
window.addEventListener('load', () => {
  const game = ECS.createGame(document.getElementById('cvs'))

  let pt = 0
  const gameLoop = (t) => {
    const dt = (t - pt) / 1000
    pt = t
    game.update(dt)
    requestAnimationFrame(gameLoop)
  }

  gameLoop(0)
})
