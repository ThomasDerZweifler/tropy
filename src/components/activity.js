'use strict'

const React = require('react')
const { PropTypes } = React
const { connect } = require('react-redux')
const { busy } = require('../selectors/activity')
const { IconSpin } = require('./icons')
const { FormattedMessage } = require('react-intl')
const cn = require('classnames')

function h(num) {
  return num ? num * 26 + 17 : 0
}

const ActivityPane = ({ activities }) => (
  <div className={cn({ 'activity-pane': true, 'busy': activities.length })}
    style={{ height: h(activities.length) }}>
    <div className="activity-container">
      {
        activities.map(({ id, type }) => (
          <div key={id}
            className={cn({ activity: true, type })}>
            <IconSpin/>
            <FormattedMessage id={`activity.${type}`}/>
          </div>
        ))
      }
    </div>
  </div>
)

ActivityPane.propTypes = {
  activities: PropTypes.array.isRequired
}

module.exports = {
  ActivityPane: connect(
    (state) => ({
      activities: busy(state)
    })
  )(ActivityPane)
}