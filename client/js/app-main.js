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

  // Shared styles.

  getSharedStyles() {
    return html` 
      <style>
        :host {
          --color1: rgba(255, 255, 255, 0.87);
          --color2: #1C4AF8;
          --color3: black;
          background-color: var(--color3);
          color: var(--color1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        [xlarge] {
          font-size: 24px;
        }
        [large] {
          font-size: 20px;
        }
        [medium] {
          font-size: 16px;
        }
        [small] {
          font-size: 14px;
        }
        [xsmall] {
          font-size: 12px;
        }
        [button] {
          background-color: var(--color2);
          border-radius: 10px;
          box-shadow: inset 0 0 4px #000000;
          padding: 5px 15px;
        }
        [button]:hover {
          box-shadow: inset 0 0 12px #000000;
          cursor: pointer;
        }
      </style>
    `
  }

  centerContent() {
    return html`
      <style>
        :host {
          align-items: center;
          justify-content: center;
        }
      </style>
    `;
  }

  // Templates below.

  renderLandingPage() {
    return html`
      ${this.getSharedStyles()}
      ${this.centerContent()}
      <div content>
        <div content-title></div>
        <div button xlarge @click="${this.createGame}">Create a new game</div>
      </div>
    `;
  }

  renderNickSelectionPage() {
    return html`
      ${this.getSharedStyles()}
      ${this.centerContent()}
      <h2>Pick a nickname:</h2>
      <input id="input" type="text">
      <div button large @click="${this.createPlayer}">Enter</div>
    `;
  }

  renderPreGamePage() {
    return html`
      <h1>Waiting lobby.</h1>
      <p>Share the following link to your friends to let them join the game:</p>
      <p>${location.origin}/?gameId=${this.gameId}</p>
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

  async queryServer(path, request) {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        gameId: this.gameId,
        playerId: this.playerId,
      }),
    });
    const json = await response.json();
    return json;
  }

  async startGame() {
    const update = await this.queryServer('/game/start');
    this.handleUpdate(update);
  }

  async createGame() {
    const response = await fetch('/game/create');
    const game = await response.json();
    this.gameId = game.gameId;
  }

  async createPlayer() {
    this.nick = this.shadowRoot.getElementById('input').value;
    const info = await this.queryServer('/game/join', {nick: this.nick});
    this.playerId = info.playerId;
    this.players = info.players;
    this.requestServerUpdate();
  }

  async requestServerUpdate() {
    setTimeout(() => this.requestServerUpdate(), 1000);
    const update = await this.queryServer('/game/update');
    this.handleUpdate(update);
  } 

  handleUpdate(update) {
    if (update.players) {
      this.players = update.players;
    }
    if (update.started === true) {
      this.gameStarted = true;      
    }
  }
}

customElements.define('app-main', AppMain);
