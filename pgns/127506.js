module.exports = [
  {
    value: function (n2k) {
      return n2k.fields['State of Charge'] / 100
    },
    filter: function (n2k) {
      return typeof n2k.fields['State of Charge'] !== 'undefined'
    },
    node: function (n2k) {
      return (
        'electrical.batteries.' +
        n2k.fields['DC Instance'] +
        '.capacity.stateOfCharge'
      )
    }
  },
  {
    source: 'State of Health',
    node: function (n2k) {
      return (
        'electrical.batteries.' +
        n2k.fields['DC Instance'] +
        '.capacity.stateOfHealth'
      )
    }
  },
  {
    allowNull: true,
    value: function (n2k) {
      var val = n2k.fields['Time Remaining']
      var res
      if (typeof val !== 'undefined') {
        res = val * 60 // convert to seconds
      } else {
        res = null
      }
      return res
    },
    node: function (n2k) {
      return (
        'electrical.batteries.' +
        n2k.fields['DC Instance'] +
        '.capacity.timeRemaining'
      )
    }
  } /*, {
    source: 'Ripple Voltage',
    node: function(n2k) {
      return 'electrical.batteries.' + n2k.fields['DC Instance'] + '.voltage.ripple'
    }
  } */
]
