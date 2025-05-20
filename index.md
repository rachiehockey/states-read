---
layout: default
---

<div id="main">
  <div id="map-container">
    <div id="controls">
      <button onclick="clearMapState()">Clear</button>
    </div>
    <div id="map">Loading...</div>
    <div id="popup"></div>
  </div>
  <div id="details"></div>
  <div id="table-container"></div>
</div>
<div id="legend" style="display: flex; gap: 3ex; justify-content: space-between; align-items: center;">
  <h2>Legend</h2>
  <div>
    <div class="pill state-pill">State</div>
    <div class="pill assessment-pill">Assessment</div>
    <div class="pill program-pill">Program</div>
  </div>
  <div>
    <div class="subtests-scale-element on">Present</div>
    <div class="subtests-scale-element off">Absent</div>
  </div>
  <div>
    <div class="qualityindicator-scale-element on">Present</div>
    <div class="qualityindicator-scale-element off">Absent</div>
    <div class="qualityindicator-scale-element neg">Negative</div>
  </div>
</div>
<div id="footer"></div>
