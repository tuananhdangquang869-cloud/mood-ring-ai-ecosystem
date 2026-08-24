export default function ConsoleTerminal({
  consoleInput,
  setConsoleInput,
  consoleHistory,
  handleConsoleSubmit,
  easterEggsUnlocked,
  cmdHistoryStack,
  cmdHistoryIndex,
  setCmdHistoryIndex,
  terminalEndRef
}) {
  return (
    <div className="console-panel">
      <div className="console-header">
        <span>SYSTEM CONSOLE TERMINAL // MR-CORE-01</span>
        <span className="console-egg-counter" title={`Easter eggs unlocked: ${easterEggsUnlocked.length}/12`}>
          🥚 {easterEggsUnlocked.length}/12 SECRETS
        </span>
      </div>
      {/* Quick hints bar */}
      <div className="console-hints-bar">
        {['help', 'scan --deep', 'ls', 'fortune', 'ping echo', 'unlock love', 'lien', '42'].map(hint => (
          <button
            key={hint}
            type="button"
            className="console-hint-btn"
            onClick={() => {
              setConsoleInput(hint)
              const inputEl = document.querySelector('.console-input')
              if (inputEl) inputEl.focus()
            }}
          >
            {hint}
          </button>
        ))}
      </div>
      <div className="console-output">
        {consoleHistory.map((line, idx) => (
          <div key={idx} className={`console-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        <div ref={terminalEndRef}></div>
      </div>
      <form onSubmit={handleConsoleSubmit} className="console-input-row">
        <span className="console-prompt">guest@MR-CORE-01:~$</span>
        <input
          type="text"
          value={consoleInput}
          onChange={(e) => { setConsoleInput(e.target.value); setCmdHistoryIndex(-1) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              const nextIdx = Math.min(cmdHistoryIndex + 1, cmdHistoryStack.length - 1)
              setCmdHistoryIndex(nextIdx)
              setConsoleInput(cmdHistoryStack[nextIdx] || '')
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              const nextIdx = Math.max(cmdHistoryIndex - 1, -1)
              setCmdHistoryIndex(nextIdx)
              setConsoleInput(nextIdx === -1 ? '' : cmdHistoryStack[nextIdx] || '')
            }
          }}
          className="console-input"
          placeholder="Enter core command... (↑/↓ for history)"
          autoFocus
          aria-label="Nhập lệnh console"
        />
      </form>
    </div>
  )
}
