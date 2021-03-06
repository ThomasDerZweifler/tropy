'use strict'

const React = require('react')
const { PureComponent } = React
const { PropTypes } = require('prop-types')
const { array, bool, func, number, object, shape, string } = PropTypes
const { ItemToolbar } = require('./toolbar')
const { ItemTabs, ItemTab } = require('./tabs')
const { NotePanel } = require('../note')
const { PanelGroup, Panel } = require('../panel')
const { PhotoPanel } = require('../photo')
const { get } = require('../../common/util')
const { keys } = Object


class ItemPanel extends PureComponent {

  get item() { // TODO remove
    const { items } = this.props
    return items.length === 1 ? items[0] : null
  }

  get isEmpty() {
    return this.props.items.length === 0
  }

  handlePhotoCreate = (options) => {
    this.props.onPhotoCreate({
      ...options,
      item: get(this.props.items, [0, 'id']) })
  }

  handleResize = (slots) => {
    this.props.onUiUpdate({ panel: { slots } })
  }

  handleTabChange = (tab) => {
    this.props.onUiUpdate({ panel: { tab } })
  }

  handleZoomChange = (zoom) => {
    this.props.onUiUpdate({ panel: { zoom } })
  }


  render() {
    const {
      edit,
      note,
      notes,
      panel,
      photo,
      isDisabled,
      isItemOpen,
      onMaximize,
      onModeChange,
      onNoteCreate,
      onNoteSelect,
      onPhotoSelect,
      onPhotoSort,
      ...props
    } = this.props

    const { item } = this

    return (
      <PanelGroup
        slots={panel.slots}
        onResize={this.handleResize}
        header={
          <ItemToolbar
            isItemOpen={isItemOpen}
            onMaximize={onMaximize}
            onModeChange={onModeChange}/>
        }>

        <Panel>
          <ItemTabs tab={panel.tab} onChange={this.handleTabChange}/>
          <ItemTab {...props}
            tab={panel.tab}
            isEmpty={this.isEmpty}
            isDisabled={isDisabled}
            isItemOpen={isItemOpen}/>
        </Panel>

        <PhotoPanel {...props}
          isDisabled={isDisabled}
          isItemOpen={isItemOpen}
          edit={edit.photo}
          zoom={panel.zoom}
          selection={photo && photo.id}
          onCreate={this.handlePhotoCreate}
          onSelect={onPhotoSelect}
          onSort={onPhotoSort}
          onZoomChange={this.handleZoomChange}/>

        <NotePanel {...props}
          isDisabled={isDisabled || !photo}
          isItemOpen={isItemOpen}
          item={item && item.id}
          photo={photo && photo.id}
          notes={notes}
          selection={note}
          onCreate={onNoteCreate}
          onSelect={onNoteSelect}/>
      </PanelGroup>
    )
  }

  static propTypes = {
    cache: string.isRequired,
    data: object.isRequired,
    edit: object.isRequired,
    isItemOpen: bool.isRequired,
    items: array.isRequired,

    note: object,
    notes: array.isRequired,

    panel: shape({
      slots: array.isRequired,
      tab: string.isRequired,
      zoom: number.isRequired
    }).isRequired,

    photo: shape({
      id: number.isRequired
    }),
    photos: array.isRequired,
    properties: object.isRequired,

    onContextMenu: func.isRequired,
    onEdit: func.isRequired,
    onEditCancel: PropTypes.func,
    onItemOpen: func.isRequired,
    onItemSave: func.isRequired,
    onItemTagAdd: func.isRequired,
    onItemTagRemove: func.isRequired,
    onMaximize: func.isRequired,
    onMetadataSave: func.isRequired,
    onModeChange: func.isRequired,
    onNoteCreate: func.isRequired,
    onNoteSelect: func.isRequired,
    onPhotoCreate: func.isRequired,
    onPhotoSelect: func.isRequired,
    onPhotoSort: func.isRequired,
    onTagCreate: func.isRequired,
    onTagSave: func.isRequired,
    onUiUpdate: func.isRequired
  }

  static props = keys(ItemPanel.propTypes)
}

module.exports = {
  ItemPanel
}
