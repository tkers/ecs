export function SpriteComponent(size, color) {
  this.size = size
  this.color = color
}

export function PositionComponent(x, y) {
  this.x = x
  this.y = y
}

export function VelocityComponent(speed, direction) {
  this.speed = speed
  this.direction = direction
}

export function TargetComponent(tx, ty) {
  this.x = tx
  this.y = ty
}

export function SelectableComponent(isSelected) {
  this.isSelected = isSelected
}
