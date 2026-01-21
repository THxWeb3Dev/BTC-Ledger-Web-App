import os
import telebot
from telebot import types
from flask import Flask
from threading import Thread

# ---------------------------------------------------------
# CONFIGURAÇÕES
# ---------------------------------------------------------
# ATENÇÃO: Cole seu Token dentro das aspas abaixo
TOKEN = "7974282847:AAE06yv4O7onpDypc8Uqx4OdLeZnX8S2OKo"

# Link do seu Web App (GitHub/Vercel)
LINK_WEB_APP = "https://btc-ledger.vercel.app/"

# Inicializa o Bot e o Flask (Site falso para o UptimeRobot)
bot = telebot.TeleBot(TOKEN)
server = Flask(__name__)

# ---------------------------------------------------------
# LÓGICA DO BOT (Respostas)
# ---------------------------------------------------------
@bot.message_handler(commands=['start'])
def boas_vindas(mensagem):
    nome = mensagem.from_user.first_name
    
    texto = f"""
⚡️ *Bem-vindo ao BTC Ledger, {nome}!*

Você acaba de acessar sua ferramenta definitiva de soberania financeira. Este não é apenas um bot, é o seu livro-razão pessoal para o universo do Bitcoin.

📊 *O QUE ESTE APP FAZ:*
• **Gestão de Portfólio:** Registre cada satoshi comprado ou vendido.
• **Ticket Médio Automático:** Saiba seu preço médio de compra.
• **Cotação em Tempo Real:** Dados da CoinGecko (BRL e USD).
• **Privacidade Absoluta:** Dados salvos apenas no seu celular.

🛠 *COMO USAR:*
1. Clique no botão *"Abrir Carteira"* abaixo.
2. Na aba **"Nova Transação"**, registre seus aportes.
3. Vá em **"Análise de Carteira"** para ver seu patrimônio.
4. Use **"Ajustes"** para fazer backup (.json).

_Don't Trust, Verify. Stay Humble, Stack Sats._ ₿

👇 *Toque abaixo para iniciar:*
"""
    
    markup = types.InlineKeyboardMarkup()
    # Botão que abre o Mini App
    web_app = types.WebAppInfo(url=LINK_WEB_APP)
    btn1 = types.InlineKeyboardButton(text="🚀 Abrir Carteira | BTC Ledger", web_app=web_app)
    markup.add(btn1)

    bot.reply_to(mensagem, texto, parse_mode="Markdown", reply_markup=markup)

# ---------------------------------------------------------
# ROTA DO UPTIME ROBOT (O "Gatilho")
# ---------------------------------------------------------
@server.route('/')
def ping():
    return "Bot BTC Ledger está ONLINE e rodando! 🚀", 200

def run_flask():
    # Pega a porta que o Render definir ou usa 5000
    server.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

def run_bot():
    bot.infinity_polling()

# ---------------------------------------------------------
# EXECUÇÃO SIMULTÂNEA
# ---------------------------------------------------------
if __name__ == "__main__":
    # Inicia o Flask em uma thread separada para não travar o bot
    t = Thread(target=run_flask)
    t.start()
    
    # Inicia o Bot
    run_bot()
