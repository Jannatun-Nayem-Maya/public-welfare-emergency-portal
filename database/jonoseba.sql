from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from flask_sqlalchemy import SQLAlchemy

from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    logout_user,
    login_required,
    current_user
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

import pymysql

pymysql.install_as_MySQLdb()


# ==========================================
# APP CONFIGURATION
# ==========================================

app = Flask(__name__)

app.secret_key = 'jonoseba_secret_key_2026'

app.config[
    'SQLALCHEMY_DATABASE_URI'
] = 'mysql+pymysql://root:12345@localhost/jonoseba_db'

app.config[
    'SQLALCHEMY_TRACK_MODIFICATIONS'
] = False

db = SQLAlchemy(app)


# ==========================================
# LOGIN MANAGER
# ==========================================

login_manager = LoginManager(app)

login_manager.login_view = 'login'


# ==========================================
# USER MODEL
# ==========================================

class User(UserMixin, db.Model):

    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    phone = db.Column(
        db.String(20)
    )

    role = db.Column(
        db.String(20),
        nullable=False,
        default='user'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# BLOOD REQUEST MODEL
# ==========================================

class BloodRequest(db.Model):

    __tablename__ = 'blood_requests'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    patient_name = db.Column(
        db.String(100),
        nullable=False
    )

    blood_group = db.Column(
        db.String(10),
        nullable=False
    )

    hospital = db.Column(
        db.String(150),
        nullable=False
    )

    contact_number = db.Column(
        db.String(20),
        nullable=False
    )

    location = db.Column(
        db.String(100),
        nullable=False
    )

    urgency = db.Column(
        db.String(50),
        default='Emergency'
    )

    details = db.Column(
        db.Text
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# RELIEF APPLICATION
# ==========================================

class ReliefApplication(db.Model):

    __tablename__ = 'relief_applications'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    nid = db.Column(
        db.String(50),
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=False
    )

    district = db.Column(
        db.String(50),
        nullable=False
    )

    disaster_type = db.Column(
        db.String(100),
        nullable=False
    )

    damage_level = db.Column(
        db.String(50),
        nullable=False
    )

    address = db.Column(
        db.Text
    )

    details = db.Column(
        db.Text
    )

    evidence_file = db.Column(
        db.String(255)
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# SCHOLARSHIP
# ==========================================

class Scholarship(db.Model):

    __tablename__ = 'scholarships'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title_bn = db.Column(
        db.String(200),
        nullable=False
    )

    title_en = db.Column(
        db.String(200),
        nullable=False
    )

    provider_bn = db.Column(
        db.String(150),
        nullable=False
    )

    provider_en = db.Column(
        db.String(150),
        nullable=False
    )

    education_level = db.Column(
        db.String(100)
    )

    district = db.Column(
        db.String(100)
    )

    deadline = db.Column(
        db.Date
    )

    eligibility_bn = db.Column(
        db.Text
    )

    eligibility_en = db.Column(
        db.Text
    )

    required_documents = db.Column(
        db.Text
    )

    apply_link = db.Column(
        db.String(255)
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# SCHOLARSHIP APPLICATION
# ==========================================

class ScholarshipApplication(db.Model):

    __tablename__ = 'scholarship_applications'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    scholarship_id = db.Column(
        db.Integer,
        db.ForeignKey('scholarships.id'),
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    nid = db.Column(
        db.String(50)
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.Text
    )

    details = db.Column(
        db.Text
    )

    document_file = db.Column(
        db.String(255)
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# GENERAL SERVICE APPLICATION
# ==========================================

class ServiceApplication(db.Model):

    __tablename__ = 'service_applications'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    service_name = db.Column(
        db.String(100),
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    nid = db.Column(
        db.String(50)
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.Text
    )

    details = db.Column(
        db.Text
    )

    document_file = db.Column(
        db.String(255)
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# WELFARE APPLICATION
# ==========================================

class WelfareApplication(db.Model):

    __tablename__ = 'welfare_applications'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    program_name = db.Column(
        db.String(150),
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    nid = db.Column(
        db.String(50)
    )

    phone = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.Text
    )

    details = db.Column(
        db.Text
    )

    document_file = db.Column(
        db.String(255)
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# VOLUNTEER PROFILE
# ==========================================

class VolunteerProfile(db.Model):

    __tablename__ = 'volunteer_profiles'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        unique=True,
        nullable=False
    )

    blood_group = db.Column(
        db.String(10)
    )

    location = db.Column(
        db.String(150)
    )

    interest_area = db.Column(
        db.String(150)
    )

    availability = db.Column(
        db.String(100)
    )

    status = db.Column(
        db.String(30),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# VOLUNTEER ACTIVITIES
# ==========================================

class VolunteerActivity(db.Model):

    __tablename__ = 'volunteer_activities'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    description = db.Column(
        db.Text
    )

    location = db.Column(
        db.String(150)
    )

    activity_date = db.Column(
        db.Date
    )

    required_volunteers = db.Column(
        db.Integer,
        default=0
    )

    status = db.Column(
        db.String(30),
        default='Upcoming'
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# STATUS HISTORY
# ==========================================

class ApplicationStatusHistory(db.Model):

    __tablename__ = 'application_status_history'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    application_type = db.Column(
        db.String(50),
        nullable=False
    )

    application_id = db.Column(
        db.Integer,
        nullable=False
    )

    old_status = db.Column(
        db.String(50)
    )

    new_status = db.Column(
        db.String(50),
        nullable=False
    )

    changed_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id')
    )

    note = db.Column(
        db.Text
    )

    changed_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# ==========================================
# LOGIN USER LOADER
# ==========================================

@login_manager.user_loader
def load_user(user_id):

    return User.query.get(int(user_id))


# ==========================================
# GLOBAL LANGUAGE
# ==========================================

@app.context_processor
def inject_lang():

    lang = session.get(
        'lang',
        'bn'
    )

    return dict(
        lang=lang
    )


# ==========================================
# LANGUAGE
# ==========================================

@app.route('/set_lang/<lang_code>')
def set_lang(lang_code):

    if lang_code in ['bn', 'en']:

        session['lang'] = lang_code

    return redirect(
        request.referrer or url_for('home')
    )


# ==========================================
# HOME
# ==========================================

@app.route('/')
def home():

    return render_template(
        'index.html'
    )


# ==========================================
# SERVICES
# ==========================================

@app.route('/services')
def services():

    return render_template(
        'services.html'
    )


# ==========================================
# SERVICE APPLY
# LOGIN REQUIRED
# ==========================================

@app.route(
    '/service_apply/<service_name>',
    methods=['GET', 'POST']
)
@login_required
def service_apply(service_name):

    allowed_services = [
        'nid',
        'passport',
        'birth',
        'welfare'
    ]

    if service_name not in allowed_services:

        flash(
            'Invalid service.',
            'danger'
        )

        return redirect(
            url_for('services')
        )


    if request.method == 'POST':

        application = ServiceApplication(

            user_id=current_user.id,

            service_name=service_name,

            full_name=request.form.get(
                'full_name'
            ),

            nid=request.form.get(
                'nid'
            ),

            phone=request.form.get(
                'phone'
            ),

            address=request.form.get(
                'address'
            ),

            details=request.form.get(
                'details'
            )
        )

        db.session.add(application)

        db.session.commit()

        flash(
            'Application submitted successfully!',
            'success'
        )

        return redirect(
            url_for('dashboard_citizen')
        )


    return render_template(
        'service_apply.html',
        service_name=service_name
    )


# ==========================================
# HEALTH / BLOOD
# ==========================================

@app.route(
    '/health',
    methods=['GET', 'POST']
)
def health():

    if request.method == 'POST':

        if not current_user.is_authenticated:

            return redirect(
                url_for(
                    'login',
                    next=url_for('health')
                )
            )


        new_request = BloodRequest(

            user_id=current_user.id,

            patient_name=request.form.get(
                'patient_name'
            ),

            blood_group=request.form.get(
                'blood_group'
            ),

            hospital=request.form.get(
                'hospital'
            ),

            contact_number=request.form.get(
                'contact_number'
            ),

            location=request.form.get(
                'location'
            ),

            urgency=request.form.get(
                'urgency',
                'Emergency'
            ),

            details=request.form.get(
                'details'
            )
        )

        db.session.add(new_request)

        db.session.commit()

        flash(
            'Blood request posted successfully!',
            'success'
        )

        return redirect(
            url_for('health')
        )


    requests_list = BloodRequest.query.order_by(
        BloodRequest.id.desc()
    ).all()

    return render_template(
        'health.html',
        requests=requests_list
    )


# ==========================================
# BLOOD DONORS
# ==========================================

@app.route('/blood_donors')
def blood_donors():

    donors = VolunteerProfile.query.filter_by(
        status='Active'
    ).all()

    return render_template(
        'blood_donors.html',
        donors=donors
    )


# ==========================================
# DISASTER ALERTS
# ==========================================

@app.route('/disaster_alerts')
def disaster_alerts():

    return render_template(
        'disaster_alerts.html'
    )


# ==========================================
# RELIEF APPLICATION
# ==========================================

@app.route(
    '/relief_apply',
    methods=['GET', 'POST']
)
def relief_apply():

    if not current_user.is_authenticated:

        return redirect(
            url_for(
                'login',
                next=url_for('relief_apply')
            )
        )


    if request.method == 'POST':

        application = ReliefApplication(

            user_id=current_user.id,

            full_name=request.form.get(
                'full_name'
            ),

            nid=request.form.get(
                'nid'
            ),

            phone=request.form.get(
                'phone'
            ),

            district=request.form.get(
                'district'
            ),

            disaster_type=request.form.get(
                'disaster_type'
            ),

            damage_level=request.form.get(
                'damage_level'
            ),

            address=request.form.get(
                'address'
            ),

            details=request.form.get(
                'details'
            )
        )

        db.session.add(application)

        db.session.commit()

        flash(
            'Relief application submitted successfully!',
            'success'
        )

        return redirect(
            url_for('dashboard_citizen')
        )


    return render_template(
        'relief_apply.html'
    )


# ==========================================
# SCHOLARSHIP
# ==========================================

@app.route('/scholarship')
def scholarship():

    scholarships_list = Scholarship.query.all()

    return render_template(
        'scholarship.html',
        scholarships=scholarships_list
    )


# ==========================================
# SCHOLARSHIP APPLY
# ==========================================

@app.route(
    '/scholarship_apply/<int:scholarship_id>',
    methods=['GET', 'POST']
)
@login_required
def scholarship_apply(scholarship_id):

    scholarship_item = Scholarship.query.get_or_404(
        scholarship_id
    )


    if request.method == 'POST':

        application = ScholarshipApplication(

            user_id=current_user.id,

            scholarship_id=scholarship_id,

            full_name=request.form.get(
                'full_name'
            ),

            nid=request.form.get(
                'nid'
            ),

            phone=request.form.get(
                'phone'
            ),

            address=request.form.get(
                'address'
            ),

            details=request.form.get(
                'details'
            )
        )

        db.session.add(application)

        db.session.commit()

        flash(
            'Scholarship application submitted!',
            'success'
        )

        return redirect(
            url_for('dashboard_citizen')
        )


    return render_template(
        'service_apply.html',
        service_name='scholarship'
    )


# ==========================================
# WELFARE
# ==========================================

@app.route('/welfare_programs')
def welfare_programs():

    return render_template(
        'welfare_programs.html'
    )


# ==========================================
# WELFARE APPLY
# ==========================================

@app.route(
    '/welfare_apply/<program_name>',
    methods=['GET', 'POST']
)
@login_required
def welfare_apply(program_name):

    if request.method == 'POST':

        application = WelfareApplication(

            user_id=current_user.id,

            program_name=program_name,

            full_name=request.form.get(
                'full_name'
            ),

            nid=request.form.get(
                'nid'
            ),

            phone=request.form.get(
                'phone'
            ),

            address=request.form.get(
                'address'
            ),

            details=request.form.get(
                'details'
            )
        )

        db.session.add(application)

        db.session.commit()

        flash(
            'Welfare application submitted!',
            'success'
        )

        return redirect(
            url_for('dashboard_citizen')
        )


    return render_template(
        'service_apply.html',
        service_name='welfare'
    )


# ==========================================
# EMERGENCY
# ==========================================

@app.route('/emergency_contacts')
def emergency_contacts():

    return render_template(
        'emergency_contacts.html'
    )


# ==========================================
# VOLUNTEER
# ==========================================

@app.route(
    '/volunteer',
    methods=['GET', 'POST']
)
def volunteer():

    activities = VolunteerActivity.query.all()


    if request.method == 'POST':

        if not current_user.is_authenticated:

            return redirect(
                url_for(
                    'login',
                    next=url_for('volunteer')
                )
            )


        existing = VolunteerProfile.query.filter_by(
            user_id=current_user.id
        ).first()


        if existing:

            flash(
                'You are already registered as a volunteer.',
                'info'
            )

        else:

            profile = VolunteerProfile(

                user_id=current_user.id,

                blood_group=request.form.get(
                    'blood_group'
                ),

                location=request.form.get(
                    'location'
                ),

                interest_area=request.form.get(
                    'interest_area'
                ),

                availability='Available',

                status='Pending'
            )

            db.session.add(profile)

            db.session.commit()

            flash(
                'Volunteer registration submitted!',
                'success'
            )


        return redirect(
            url_for('volunteer')
        )


    return render_template(
        'volunteer.html',
        activities=activities
    )


# ==========================================
# CITIZEN DASHBOARD
# ==========================================

@app.route('/dashboard_citizen')
@login_required
def dashboard_citizen():

    reliefs = ReliefApplication.query.filter_by(
        user_id=current_user.id
    ).all()

    services_list = ServiceApplication.query.filter_by(
        user_id=current_user.id
    ).all()

    scholarships = ScholarshipApplication.query.filter_by(
        user_id=current_user.id
    ).all()

    welfare = WelfareApplication.query.filter_by(
        user_id=current_user.id
    ).all()

    blood = BloodRequest.query.filter_by(
        user_id=current_user.id
    ).all()


    return render_template(
        'dashboard_citizen.html',

        applications=reliefs,

        services=services_list,

        scholarships=scholarships,

        welfare=welfare,

        blood_requests=blood
    )


# ==========================================
# ADMIN DASHBOARD
# ==========================================

@app.route('/admin_dashboard')
@login_required
def admin_dashboard():

    if current_user.role != 'admin':

        flash(
            'Admin access required.',
            'danger'
        )

        return redirect(
            url_for('home')
        )


    users = User.query.order_by(
        User.id.desc()
    ).all()

    reliefs = ReliefApplication.query.order_by(
        ReliefApplication.id.desc()
    ).all()

    services_list = ServiceApplication.query.order_by(
        ServiceApplication.id.desc()
    ).all()

    scholarship_apps = ScholarshipApplication.query.order_by(
        ScholarshipApplication.id.desc()
    ).all()

    welfare_apps = WelfareApplication.query.order_by(
        WelfareApplication.id.desc()
    ).all()

    blood = BloodRequest.query.order_by(
        BloodRequest.id.desc()
    ).all()


    return render_template(
        'admin_dashboard.html',

        users=users,

        applications=reliefs,

        services=services_list,

        scholarship_apps=scholarship_apps,

        welfare_apps=welfare_apps,

        blood_requests=blood
    )


# ==========================================
# UPDATE RELIEF STATUS
# ==========================================

@app.route(
    '/admin/relief/<int:application_id>/<status>'
)
@login_required
def update_relief_status(
    application_id,
    status
):

    if current_user.role != 'admin':

        return redirect(
            url_for('home')
        )


    application = ReliefApplication.query.get_or_404(
        application_id
    )

    old_status = application.status

    application.status = status


    history = ApplicationStatusHistory(

        application_type='relief',

        application_id=application.id,

        old_status=old_status,

        new_status=status,

        changed_by=current_user.id,

        note='Status updated by admin'
    )

    db.session.add(history)

    db.session.commit()


    flash(
        'Application status updated.',
        'success'
    )

    return redirect(
        url_for('admin_dashboard')
    )


# ==========================================
# LOGIN
# ==========================================

@app.route(
    '/login',
    methods=['GET', 'POST']
)
def login():

    if request.method == 'POST':

        email = request.form.get(
            'email',
            ''
        ).strip().lower()

        password = request.form.get(
            'password',
            ''
        )

        role = request.form.get(
            'role',
            'user'
        )


        user = User.query.filter_by(
            email=email,
            role=role
        ).first()


        if user and check_password_hash(
            user.password,
            password
        ):

            login_user(user)

            flash(
                'Logged in successfully!',
                'success'
            )


            next_page = request.args.get(
                'next'
            )

            if next_page:

                return redirect(next_page)


            if user.role == 'admin':

                return redirect(
                    url_for('admin_dashboard')
                )

            return redirect(
                url_for('home')
            )


        flash(
            'Invalid email, password or role.',
            'danger'
        )


    return render_template(
        'login.html'
    )


# ==========================================
# REGISTER
# ==========================================

@app.route(
    '/register',
    methods=['GET', 'POST']
)
def register():

    if request.method == 'POST':

        name = request.form.get(
            'name',
            ''
        ).strip()

        email = request.form.get(
            'email',
            ''
        ).strip().lower()

        password = request.form.get(
            'password',
            ''
        )

        phone = request.form.get(
            'phone',
            ''
        )

        role = request.form.get(
            'role',
            'user'
        )


        allowed_roles = [
            'student',
            'volunteer',
            'user'
        ]


        # User cannot register himself as admin
        if role not in allowed_roles:

            role = 'user'


        existing_user = User.query.filter_by(
            email=email
        ).first()


        if existing_user:

            flash(
                'This email is already registered.',
                'danger'
            )

            return redirect(
                url_for('register')
            )


        hashed_password = generate_password_hash(
            password
        )


        new_user = User(

            name=name,

            email=email,

            password=hashed_password,

            phone=phone,

            role=role
        )


        db.session.add(new_user)

        db.session.commit()


        flash(
            'Registration successful. Please login.',
            'success'
        )

        return redirect(
            url_for('login')
        )


    return render_template(
        'register.html'
    )


# ==========================================
# LOGOUT
# ==========================================

@app.route('/logout')
@login_required
def logout():

    logout_user()

    flash(
        'Logged out successfully.',
        'info'
    )

    return redirect(
        url_for('home')
    )


# ==========================================
# RUN
# ==========================================

if __name__ == '__main__':

    app.run(
        debug=True
    )