from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.models import User
from app import db

admin = Blueprint('admin', __name__, url_prefix='/admin')


@admin.route('/dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash('Accès interdit.', 'danger')
        return redirect(url_for('main.home'))
    return render_template('admin.html', show_sidebar=True)


@admin.route('/users')
@login_required
def users():
    if not current_user.is_admin:
        flash('Accès interdit.', 'danger')
        return redirect(url_for('main.home'))
    users = User.query.all()
    return render_template('admin.html', users=users, show_sidebar=True)


@admin.route('/users/create', methods=['GET', 'POST'])
@login_required
def create_user():
    if not current_user.is_admin:
        flash('Accès interdit.', 'danger')
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        is_admin = bool(request.form.get('is_admin'))

        # Validation
        if not username or not email or not password:
            flash('Tous les champs sont requis.', 'danger')
            return redirect(url_for('admin.create_user'))

        if User.query.filter_by(username=username).first():
            flash('Nom d\'utilisateur déjà pris.', 'danger')
            return redirect(url_for('admin.create_user'))

        if User.query.filter_by(email=email).first():
            flash('Email déjà utilisé.', 'danger')
            return redirect(url_for('admin.create_user'))

        # Création de l'utilisateur
        new_user = User(username=username, email=email, is_admin=is_admin)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('Utilisateur créé avec succès.', 'success')
        return redirect(url_for('admin.users'))

    return render_template('admin_create.html', show_sidebar=True)


@admin.route('/users/edit/<int:user_id>', methods=['GET', 'POST'])
@login_required
def edit_user(user_id):
    if not current_user.is_admin:
        flash('Accès interdit.', 'danger')
        return redirect(url_for('main.home'))

    user = User.query.get_or_404(user_id)

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        is_admin = bool(request.form.get('is_admin'))
        password = request.form.get('password')

        if not username or not email:
            flash('Tous les champs sont requis.', 'danger')
            return redirect(url_for('admin.edit_user', user_id=user_id))

        # Vérifier unicité username/email sauf pour l'utilisateur actuel
        if User.query.filter(User.username == username, User.id != user_id).first():
            flash('Nom d\'utilisateur déjà pris.', 'danger')
            return redirect(url_for('admin.edit_user', user_id=user_id))

        if User.query.filter(User.email == email, User.id != user_id).first():
            flash('Email déjà utilisé.', 'danger')
            return redirect(url_for('admin.edit_user', user_id=user_id))

        user.username = username
        user.email = email
        user.is_admin = is_admin

        if password:
            user.set_password(password)

        db.session.commit()
        flash('Utilisateur modifié avec succès.', 'success')
        return redirect(url_for('admin.users'))

    return render_template('admin_edit.html', user=user, show_sidebar=True)


@admin.route('/users/delete/<int:user_id>', methods=['POST'])
@login_required
def delete_user(user_id):
    if not current_user.is_admin:
        flash('Accès interdit.', 'danger')
        return redirect(url_for('main.home'))

    user = User.query.get_or_404(user_id)

    # Empêcher l'admin de se supprimer lui-même
    if user.id == current_user.id:
        flash('Vous ne pouvez pas vous supprimer vous-même.', 'warning')
        return redirect(url_for('admin.users'))

    db.session.delete(user)
    db.session.commit()
    flash('Utilisateur supprimé avec succès.', 'success')
    return redirect(url_for('admin.users'))
