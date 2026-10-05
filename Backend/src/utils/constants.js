const TRUST_PENALTIES = {
  tab_switch: 10,
  no_face: 15,
  multi_face: 25,
  silence: 10,
  camera_off: 20,
  copy_attempt: 15,
  paste_attempt: 20,
  right_click: 10,
};

const TRUST_THRESHOLD = 50;

module.exports = {
  TRUST_PENALTIES,
  TRUST_THRESHOLD
};