from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import pymysql

pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.secret_key = 'jonoseba_secret_key_2026'

# MySQL Database Configuration (পাসওয়ার্ড আপডেট করা হয়েছে)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:12345@localhost/jonoseba_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# User Model
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default='user')

# Blood Request Model
class BloodRequest(db.Model):
    __tablename__ = 'blood_requests'
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    blood_group = db.Column(db.String(10), nullable=False)
    hospital = db.Column(db.String(150), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    urgency = db.Column(db.String(50), default='Emergency')
    details = db.Column(db.Text)

# Scholarship Model
class Scholarship(db.Model):
    __tablename__ = 'scholarships'
    id = db.Column(db.Integer, primary_key=True)
    title_bn = db.Column(db.String(200), nullable=False)
    title_en = db.Column(db.String(200), nullable=False)
    provider_bn = db.Column(db.String(150), nullable=False)
    provider_en = db.Column(db.String(150), nullable=False)
    deadline = db.Column(db.String(50))
    eligibility_bn = db.Column(db.Text)
    eligibility_en = db.Column(db.Text)
    apply_link = db.Column(db.String(255))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Inject Language variable globally
@app.context_processor
def inject_lang():
    lang = session.get('lang', 'bn')
    return dict(lang=lang)

# Language switch route
@app.route('/set_lang/<lang_code>')
def set_lang(lang_code):
    session['lang'] = lang_code
    return redirect(request.referrer or url_for('home'))

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/health', methods=['GET', 'POST'])
def health():
    if request.method == 'POST':
        patient_name = request.form.get('patient_name')
        blood_group = request.form.get('blood_group')
        hospital = request.form.get('hospital')
        contact_number = request.form.get('contact_number')
        location = request.form.get('location')
        urgency = request.form.get('urgency', 'Emergency')
        details = request.form.get('details')

        new_req = BloodRequest(
            patient_name=patient_name,
            blood_group=blood_group,
            hospital=hospital,
            contact_number=contact_number,
            location=location,
            urgency=urgency,
            details=details
        )
        db.session.add(new_req)
        db.session.commit()
        
        msg = 'রক্তদানের অনুরোধ সফলভাবে পোস্ট করা হয়েছে!' if session.get('lang') == 'bn' else 'Blood request posted successfully!'
        flash(msg, 'success')
        return redirect(url_for('health'))

    requests_list = BloodRequest.query.order_by(BloodRequest.id.desc()).all()
    return render_template('health.html', requests=requests_list)

@app.route('/scholarship')
def scholarship():
    scholarships_list = Scholarship.query.all()
    return render_template('scholarship.html', scholarships=scholarships_list)

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email, password=password).first()
        if user:
            login_user(user)
            msg = 'সফলভাবে লগইন করেছেন!' if session.get('lang') == 'bn' else 'Logged in successfully!'
            flash(msg, 'success')
            return redirect(url_for('home'))
        else:
            msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!' if session.get('lang') == 'bn' else 'Invalid email or password!'
            flash(msg, 'danger')
            
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    msg = 'লগআউট করা হয়েছে।' if session.get('lang') == 'bn' else 'Logged out successfully.'
    flash(msg, 'info')
    return redirect(url_for('home'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)