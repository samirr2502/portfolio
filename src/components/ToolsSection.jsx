import ToolsGroup from "./toolsGroups";

function ToolsSection({ tools }) {
  return (
    <div className="toolsStage">
      <header className="stageHeader">
        <p className="stageKicker">04 — Tools</p>
        <h2>Tools & languages</h2>
        <p className="stageSupport">The stack I reach for across product, APIs, and infrastructure.</p>
      </header>

      <div className="toolsGrid">
        {tools.map((tool) => (
          <ToolsGroup key={tool.position} item={tool} />
        ))}
      </div>

      <footer className="toolsFooter">
        <a href="mailto:samirrodriguez14@gmail.com">samirrodriguez14@gmail.com</a>
        <span>© {new Date().getFullYear()} SR2</span>
      </footer>
    </div>
  );
}

export default ToolsSection;
