from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from app.models import Score
from app import db

game_bp = Blueprint('game', __name__, url_prefix='/game')

@game_bp.route('/')
@login_required
def play():
    return render_template('game.html')

@game_bp.route('/score', methods=['POST'])
@login_required
def save_score():
    data = request.get_json()
    score_value = data.get('score')
    if score_value is None:
        return jsonify({"error": "No score provided"}), 400

    new_score = Score(user_id=current_user.id, value=score_value, time_played=0, timestamp=None)
    db.session.add(new_score)
    db.session.commit()
    return jsonify({"message": "Score saved"}), 200
