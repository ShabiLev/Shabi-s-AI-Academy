import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentUi } from "../agents/agentUi";
import {
  simulateAgent,
  type SimulationScenario,
  type SimulationStep,
} from "../agents/agentSimulation";
export function AgentSimulationPage() {
  const { agentId = "" } = useParams(),
    { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = agentUi[ui],
    { get, state, saveSimulationInput } = useAgentLibrary(),
    a = get(agentId),
    [input, setInput] = useState(state.lastSimulationInput ?? ""),
    [scenario, setScenario] = useState<SimulationScenario>("success"),
    [steps, setSteps] = useState<SimulationStep[]>([]);
  if (!a)
    return (
      <div className="page">
        <h1>{s.unknown}</h1>
      </div>
    );
  return (
    <div className="page agent-simulation">
      <header className="library-heading">
        <div>
          <h1>
            {s.simulate}: {a.name}
          </h1>
          <p className="simulation-warning">{s.simulationOnly}</p>
        </div>
        <Link to="/how-to#agent-simulation">{s.help}</Link>
      </header>
      <section className="settings-card">
        <label>
          {s.sampleInput}
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              saveSimulationInput(e.target.value);
            }}
          />
        </label>
        <label>
          {s.scenario}
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as SimulationScenario)}
          >
            {[
              "success",
              "validationFailure",
              "retry",
              "approval",
              "maxRetries",
              "incomplete",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSteps(simulateAgent(a, scenario, input))}
        >
          {s.run}
        </button>
      </section>
      {steps.length > 0 && (
        <ol className="simulation-timeline" aria-live="polite">
          {steps.map((step) => (
            <li key={step.sequence}>
              <strong>
                {step.sequence}. {step.stage}
              </strong>
              <p>{step.action}</p>
              <p>{step.result}</p>
              <span>
                Validation: {step.validation} · {step.decision}
              </span>
              {step.warning && <p role="status">{step.warning}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
