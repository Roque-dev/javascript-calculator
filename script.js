class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: '0',
      formula: '',
      evaluated: false
    };
    this.handleClear = this.handleClear.bind(this);
    this.handleNumbers = this.handleNumbers.bind(this);
    this.handleDecimal = this.handleDecimal.bind(this);
    this.handleOperators = this.handleOperators.bind(this);
    this.handleEvaluate = this.handleEvaluate.bind(this);
  }

  handleClear() {
    this.setState({
      display: '0',
      formula: '',
      evaluated: false
    });
  }

  handleNumbers(e) {
    const value = e.target.innerText;
    this.setState(prevState => {
      const { display, formula, evaluated } = prevState;

      if (evaluated) {
        return {
          display: value,
          formula: value,
          evaluated: false
        };
      }

      if (display === '0' && value === '0') {
        return null;
      }

      if (display === '0' || /[+\-*/]/.test(display)) {
        return {
          display: value,
          formula: formula === '0' ? value : formula + value
        };
      } else {
        return {
          display: display + value,
          formula: formula + value
        };
      }
    });
  }

  handleDecimal() {
    const value = '.';
    this.setState(prevState => {
      const { display, formula, evaluated } = prevState;

      if (evaluated) {
        return {
          display: '0.',
          formula: '0.',
          evaluated: false
        };
      }

      if (/[+\-*/]/.test(display)) {
        return {
          display: '0.',
          formula: formula + '0.'
        };
      }

      if (!display.includes('.')) {
        return {
          display: display + value,
          formula: formula + value
        };
      }

      return null;
    });
  }

  handleOperators(e) {
    // Normalizamos los símbolos para que la lógica de operadores funcione correctamente
    let value = e.target.innerText;
    if (value === 'x') value = '*';
    if (value === '÷') value = '/';

    this.setState(prevState => {
      const { formula, display, evaluated } = prevState;

      // Historia de usuario #14: Si se presiona un operador inmediatamente después de "=",
      // se inicia un nuevo cálculo usando el resultado anterior almacenado en `display`.
      if (evaluated) {
        return {
          formula: display + value,
          display: value,
          evaluated: false
        };
      }

      if (formula === '') {
        return {
          formula: display + value,
          display: value
        };
      }

      // Historia de usuario #13: Manejo estricto de operadores consecutivos.
      const matches = formula.match(/[+\-*/]+$/);

      if (matches) {
        const lastOpChain = matches[0];

        // Si el operador actual es '-' y el último bloque no termina en '-', permitimos el signo negativo anidado (ej: 5 * -)
        if (value === '-' && !lastOpChain.endsWith('-')) {
          return {
            formula: formula + value,
            display: value
          };
        } else {
          // De lo contrario, el nuevo operador reemplaza por completo a toda la cadena de operadores al final.
          const baseFormula = formula.slice(0, formula.length - lastOpChain.length);
          return {
            formula: baseFormula + value,
            display: value
          };
        }
      } else {
        return {
          formula: formula + value,
          display: value
        };
      }
    });
  }

  handleEvaluate() {
    this.setState(prevState => {
      const { formula, evaluated } = prevState;
      if (evaluated || formula === '') return null;

      try {
        let cleanFormula = formula.replace(/x/g, '*').replace(/÷/g, '/');

        // Limpia cualquier operador suelto al final antes de evaluar
        while (/[+\-*/]$/.test(cleanFormula)) {
          cleanFormula = cleanFormula.slice(0, -1);
        }

        let result = eval(cleanFormula);
        result = Math.round(result * 100000000) / 100000000;

        return {
          display: result.toString(),
          formula: formula + '=' + result,
          evaluated: true
        };
      } catch (err) {
        return { display: 'Error' };
      }
    });
  }

  render() {
    return (
      <div className="calculator">
        <div className="formula-screen">{this.state.formula}</div>
        <div id="display">{this.state.display}</div>

        <div className="buttons-grid">
          <button id="clear" onClick={this.handleClear}>AC</button>
          <button id="divide" onClick={this.handleOperators}>÷</button>
          <button id="multiply" onClick={this.handleOperators}>x</button>

          <button id="seven" onClick={this.handleNumbers}>7</button>
          <button id="eight" onClick={this.handleNumbers}>8</button>
          <button id="nine" onClick={this.handleNumbers}>9</button>
          <button id="subtract" onClick={this.handleOperators}>-</button>

          <button id="four" onClick={this.handleNumbers}>4</button>
          <button id="five" onClick={this.handleNumbers}>5</button>
          <button id="six" onClick={this.handleNumbers}>6</button>
          <button id="add" onClick={this.handleOperators}>+</button>

          <button id="one" onClick={this.handleNumbers}>1</button>
          <button id="two" onClick={this.handleNumbers}>2</button>
          <button id="three" onClick={this.handleNumbers}>3</button>

          <button id="equals" onClick={this.handleEvaluate}>=</button>

          <button id="zero" onClick={this.handleNumbers}>0</button>
          <button id="decimal" onClick={this.handleDecimal}>.</button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));