import {LitElement, html} from 'https://unpkg.com/lit-element/lit-element.js?module';

class AppMain extends LitElement {
  static get properties() {
    return {
      gameId: {type: Number},
      playerId: {type: Number},
      players: {type: Array},
      gameStarted: {type: Boolean},
    }
  }

  constructor() {
    super();
    this.gameId = null;
    this.playerId = null;
    this.nick = null;
    this.gameStarted = false;
    this.players = null;
  }

  startGame() {
    this.gameStarted = true;
  }

  async createGame() {
    const response = await fetch('/game/create');
    const game = await response.json();
    this.gameId = game.gameId;
  }

  async createPlayer() {
    this.nick = this.shadowRoot.getElementById('input').value;
    const response = await fetch('/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: this.gameId,
        nick: this.nick,
      }),
    });
    const info = await response.json();
    this.playerId = info.playerId;
    this.players = info.players;
    this.requestServerUpdate();
  }

  async requestServerUpdate() {
    setTimeout(() => this.requestServerUpdate(), 1000);
    const response = await fetch('/game/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: this.gameId,
      }),
    });
    const update = await response.json();
    if (update.players) {
      this.players = update.players;
    }
  }
  
  render() {
    if (this.gameId == null) {
      return this.renderLandingPage();
    }
    if (this.playerId == null) {
      return this.renderNickSelectionPage();
    }
    if (!this.gameStarted) {
      return this.renderPreGamePage();
    }
    return this.renderGamePage();
  }

  renderLandingPage() {
    return html`
      <button @click="${this.createGame}">Create a new game</button>
    `;
  }

  renderNickSelectionPage() {
    return html`
      <h2>Pick a nickname:</h2>
      <input id="input" type="text">
      <button @click="${this.createPlayer}">Enter</button>
    `;
  }

  renderPreGamePage() {
    return html`
      <h1>Waiting lobby.</h1>
      <p>Share the following link to your friends to let them join the game:</p>
      <p>TODO/?gameId=${this.gameId}</p>
      <h2>Players connected</h2>
      <ul>
        ${this.players.map(nick => html`
          <li>
            ${nick === this.nick ? html`<b>${nick}</b>` : html`${nick}`}
          </li>
        `)}
      </ul>
      ${this.players.length > 1 ? html`<button @click="${this.startGame}">Start game</button>` : html``}
    `;
  }
// ${this.players.length > 1 ? html`<button @click="${this.startGame}">Start game</button>`}
  renderGamePage() {
    return html`
      <p>Game is starting! There are ${this.players.length} players registered.</p>
    `
  }
}

customElements.define('app-main', AppMain);
