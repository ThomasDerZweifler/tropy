'use strict'

const React = require('react')
const { PureComponent, PropTypes } = React
const { arrayOf, number, string, shape, object, func } = PropTypes
const { Tag } = require('./tag')
const { get, noop } = require('../../common/util')
const { match } = require('../../keymap')


class TagList extends PureComponent {

  isEditing(tag) {
    return get(this.props.edit, ['id']) === tag.id
  }

  isSelected(tag) {
    return this.props.selection.includes(tag.id)
  }


  handleContextMenu = (event, tag) => {
    const { selection, onSelect, onContextMenu } = this.props

    if (!this.isSelected(tag) || selection.length > 1) {
      onSelect(tag.id, { mod: 'replace' })
    }

    onContextMenu(event, tag)
  }

  handleKeyDown = (event, tag) => {
    switch (match(this.props.keymap, event)) {
      case 'remove':
        this.props.onRemove(tag.id)
        break
      default:
        return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  render() {
    const { tags, onEditCancel, onSelect, onSave } = this.props

    return (
      <ol className="tag list">
        {tags.map(tag =>
          <Tag
            key={tag.id}
            tag={tag}
            isEditing={this.isEditing(tag)}
            isSelected={this.isSelected(tag)}
            onChange={onSave}
            onEditCancel={onEditCancel}
            onKeyDown={this.handleKeyDown}
            onSelect={onSelect}
            onContextMenu={this.handleContextMenu}/>)}
      </ol>
    )
  }

  static propTypes = {
    tags: arrayOf(shape({
      id: number.isRequired,
      name: string.isRequired
    })).isRequired,

    selection: arrayOf(number).isRequired,
    keymap: object.isRequired,
    edit: object,

    onEditCancel: func.isRequired,
    onRemove: func.isRequired,
    onSelect: func.isRequired,
    onSave: func.isRequired,
    onContextMenu: func.isRequired
  }

  static defaultProps = {
    selection: [],
    onSelect: noop
  }
}

module.exports = {
  TagList
}
