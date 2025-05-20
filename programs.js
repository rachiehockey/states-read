import {
  setDetails,
  clearDetails,
  enterTableMode,
  formatSingleStatePill,
  getSortFunction,
  highlightStates,
  showKeyValueIfDefined,
} from "./util.js";
import { states, getNumberOfStatesWithAnyProgramApprovals } from "./states.js";


let programs;
let currentSortFunction = getSortFunction('name');

class Program {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.approvingStates = [];
    this.company = null;
    this.aligned = null;
    this.feasible = null;
    this.topics = [];
    this.qualityIndicators = [];
    this.negativeQualityIndicators = [];
    this.timeRequiredFirstGradeMinutes = 0;
  }
}

const TOPICS = {
  P: "Phonemic awareness",
  W: "Word Work",
  G: "Grammar",
  R: "Writing",
  V: "Vocabulary",
  F: "Fluency",
  C: "Reading Comprehension",
};

const QUALITY_INDICATORS = {
  E: 'Evidence',
  R: 'Cultural responsiveness',
  A: 'Alignment to standards',
  F: 'Feasibility',
  C: 'Content focus',
};

export const processProgramData = (raw) => {
  programs = {};
  const programBlocks = raw.split("\n\n");
  for (let block of programBlocks) {
    const keyValues = block.split("\n");
    const program = new Program("noid", "Unknown Program");
    for (let keyValue of keyValues) {
      let [key, value] = keyValue.split("|").map((a) => a.trim());
      if (value === "n/a") {
        continue;
      }
      if (key === "id") {
        program.id = value;
      } else if (key.toLowerCase() === "name") {
        program.name = value;
      } else if (key.toLowerCase() === "company") {
        program.company = value;
      } else if (key.toLowerCase() === "time required 1st grade") {
        program.timeRequiredFirstGradeMinutes = parseInt(value);
      } else if (key.toLowerCase() === "year of last update") {
        program.yearOfLastUpdate = value;
      } else if (key.toLowerCase() === "year of publication") {
        program.yearOfPublication = value;
      } else if (key.toLowerCase() === "available grade levels") {
        program.availableGradeLevels = value;
      } else if (key.toLowerCase() === "owners") {
        program.owners = value;
      } else if (key.toLowerCase() === "advertised alongside") {
        program.advertisedAlongside = value;
      } else if (key.toLowerCase() === "quality indicators") {
        if (value.trim() === '') {
          continue;
        }
        const indicators = value.trim().split(",").map(l => l.trim());
        for (const t of indicators) {
          let indicator;
          if (t.startsWith('-')) {
            indicator = t.substring(1);
            program.negativeQualityIndicators.push(t.substring(1));
          } else {
            indicator = t;
            program.qualityIndicators.push(t);
          }
          if (!Object.keys(QUALITY_INDICATORS).includes(indicator)) {
            alert('Sorry, I do not know about indicator with letter "' + t + '"');
          }
        }
      } else if (key.toLowerCase() === "topic coverage") {
        if (value.trim() === '') {
          continue;
        }
        program.topics = value.trim().split(",").map(l => l.trim());
        for (let s of program.topics) {
          if (!Object.keys(TOPICS).includes(s)) {
            alert('Sorry, I do not know about topic with letter "' + s + '"');
          }
        }
      } else if (key === "states") {
        const approvingStates = value.trim().split(",");
        for (let stateCode of approvingStates) {
          stateCode = stateCode.trim();
          if (!stateCode) {
            continue;
          }
          if (!states[stateCode]) {
            alert('Sorry I do not know about state "' + stateCode + '"');
            continue;
          }
          states[stateCode].approvedPrograms.push(program.id);
        }
        program.approvingStates = approvingStates;
      }
    }
    programs[program.id] = program;
  }
};

const parseContentFocus = (s) => {
  if (s.includes("not rated")) {
    return "";
  }
  return s.split("-").map((a) => a.trim());
};

const formatContentFocus = (p) => {
  if (!p.contentFocusLowHigh) {
    return "";
  }
  return p.contentFocusLowHigh[0] + " — " + p.contentFocusLowHigh[1] + "%";
};

const formatTimeRequiredFirstGrade = (program) => {
  if (!program.timeRequiredFirstGradeMinutes) {
    return "";
  }
  return program.timeRequiredFirstGradeMinutes + " minutes";
};

const formatQualityIndicatorScale = (program) => {
  return `
    <div class="qualityindicator-scale">
      ${Object.keys(QUALITY_INDICATORS).map(k => `
        <div class="qualityindicator-scale-element ${
          program.qualityIndicators.includes(k) ? 'on' :
          program.negativeQualityIndicators.includes(k) ? 'neg' : 'off'
        }"
             title="${QUALITY_INDICATORS[k]}"
        >${QUALITY_INDICATORS[k]}</div>
        `).join('')}
    </div>
  `;
};

const formatTopicsScale = (program) => {
  return `
    <div class="topics-scale">
      ${Object.keys(TOPICS).map(k => `
        <div class="topics-scale-element ${program.topics.includes(k) ? 'on' : 'off'}"
             title="${TOPICS[k]}"
        >${TOPICS[k]}</div>
        `).join('')}
    </div>
  `;
};


const formatProgramDetails = (id) => {
  const program = programs[id];
  const timeRequiredFirstGrade = formatTimeRequiredFirstGrade(program);

  const percentOfStateApprovals = Math.round(
    (100 * program.approvingStates.length) /
      getNumberOfStatesWithAnyProgramApprovals()
  );
  const percentOfStateApprovalsCalculation =
    "" +
    program.approvingStates.length +
    "/" +
    getNumberOfStatesWithAnyProgramApprovals();

  return `
      <h1 class="program">${program.name}</h1>
      <h2>Approval</h2>
      <p><b>Approved in ${program.approvingStates.length} states: </b>
      ${program.approvingStates.map(formatSingleStatePill).join(" ")}
      <p><b>Percent of state approvals</b>: ${percentOfStateApprovals}% (${percentOfStateApprovalsCalculation})</p>
      </p>
      <h2>Publication Information</h2>
      ${showKeyValueIfDefined(
        "Est. time Required 1<sup>st</sup> grade",
        timeRequiredFirstGrade
      )}
      ${showKeyValueIfDefined("Company", program.company)}
      ${showKeyValueIfDefined("Owners", program.owners)}
      ${showKeyValueIfDefined("Available Grade Levels", program.availableGradeLevels)}
      ${showKeyValueIfDefined(
        "Advertised alongside",
        program.advertisedAlongside
      )}
      ${showKeyValueIfDefined("Year of publication", program.yearOfPublication)}
      ${showKeyValueIfDefined("Year of last update", program.yearOfLastUpdate)}
      <h2>Quality Indicators</h2>
      ${formatQualityIndicatorScale(program)}
      <h2>Topic Coverage</h2>
      ${formatTopicsScale(program)}
      <p style="margin-top: 20px;"></p>
      <p style="text-align: center">
        <big><a href="#" onclick="comparePrograms()" style="text-decoration: none">Compare Programs</a></big>
      </p>
    `;
};


const formatProgramRowInTable = (program) => {
  let timeRequired = "";
  if (program.timeRequiredFirstGradeMinutes) {
    timeRequired = !!program.timeRequiredFirstGradeMinutes.length
      ? program.timeRequiredFirstGradeMinutes[0] + " — " + program.timeRequiredFirstGradeMinutes[1]
      : program.timeRequiredFirstGradeMinutes;
  }
  return `
    <tr>
      <td class="odd">${program.name || ""}</td>
      <td class="even">${program.company || ""}</td>
      <td class="odd">${program.advertisedAlongside || ""}</td>
      <td class="even">${program.owners || ""}</td>
      <td class="odd">${timeRequired}</td>
      <td class="even">${program.yearOfPublication || ""}</td>
      <td class="odd">${formatTopicsScale(program)}</td>
      <td class="even">${formatQualityIndicatorScale(program)}</td>
    </tr>
  `;
};

export const formatSingleProgramPill = (id) => {
  return `
      <div class="pill program-pill"
          title="${programs[id].name}"
          onclick="showProgram('${id}')">${programs[id].name}</div>
    `;
};

export const comparePrograms = () => {
  enterTableMode();

  document.getElementById("table-container").innerHTML = `
    <div onclick="enterMapMode()" style="cursor: pointer">⬅️ Back to Map</div>
    <h1>Programs</h1>
    <table>
      <tr class="header">
        <th class="odd" onclick="sortProgramsOn('name')">Name</th>
        <th class="even" onclick="sortProgramsOn('company')">Company</th>
        <th class="odd" onclick="sortProgramsOn('advertisedAlongside')">Advertised alongside</th>
        <th class="even" onclick="sortProgramsOn('owners')">Owners</th>
        <th class="odd" onclick="sortProgramsOn('timeRequiredFirstGradeMinutes')">Time<br/>required<br/>(minutes)</th>
        <th class="even" onclick="sortProgramsOn('yearOfPublication')">Year of<br/>publication</th>
        <th class="odd" onclick="sortProgramsOn('topics')">Topics</th>
        <th class="even" onclick="sortProgramsOn('qualityIndicator')">Quality indicator</th>
      </tr>
    ${Object.values(programs).sort(currentSortFunction).map(formatProgramRowInTable).join("\n")}
    </table>
  `;
};


const showProgram = (id) => {
  clearDetails();
  const program = programs[id];
  highlightStates(program.approvingStates, states);

  setDetails(formatProgramDetails(id));
};

const sortProgramsOn = (key) => {
  currentSortFunction = getSortFunction(key);
  comparePrograms();
};

window.showProgram = showProgram;
window.comparePrograms = comparePrograms;
window.sortProgramsOn = sortProgramsOn;