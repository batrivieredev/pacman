from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'ta_clef_secrete'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    with app.app_context():
        from app.models import User
        db.create_all()

        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin', email='admin@example.com', is_admin=True)
            admin_user.set_password('admin')
            db.session.add(admin_user)
            db.session.commit()
            print("Admin créé avec login/admin")

    # Import des blueprints
    from app.routes.auth import auth
    from app.routes.main import main
    from app.routes.game import game_bp
    from app.routes.admin import admin  # <-- Ajouté ici

    # Enregistrement des blueprints
    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(game_bp)
    app.register_blueprint(admin)  # <-- Ajouté ici

    return app
