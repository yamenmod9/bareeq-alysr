"""
Flask Application
Handles Flask-SQLAlchemy initialization and admin routes
"""
from flask import Flask, jsonify
from flask_cors import CORS

from app.config import get_config
from app.database import db, migrate, create_all_tables, init_db


def create_flask_app() -> Flask:
    """
    Create and configure the Flask application
    Used for Flask-SQLAlchemy and admin functionality
    """
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Initialize extensions using init_db to store the app reference
    init_db(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Import models to register them with SQLAlchemy
    with app.app_context():
        from app.models import (
            User, Customer, Merchant, Branch,
            PurchaseRequest, Transaction, Payment,
            Settlement, RepaymentPlan, RepaymentSchedule
        )
    
    # Register Flask blueprints (admin routes)
    register_flask_routes(app)
    
    return app


def register_flask_routes(app: Flask):
    """Register Flask-specific routes (admin, health, etc.)"""
    
    @app.route('/health')
    def flask_health():
        """Flask health check endpoint"""
        return jsonify({
            "status": "healthy",
            "framework": "flask",
            "database": "connected"
        })
    
    @app.route('/admin/stats')
    def admin_stats():
        """Admin statistics endpoint (Flask-based)"""
        from app.models import User, Customer, Merchant, Transaction, Settlement
        from sqlalchemy import func
        
        with app.app_context():
            stats = {
                "total_users": User.query.count(),
                "total_customers": Customer.query.count(),
                "total_merchants": Merchant.query.count(),
                "total_transactions": Transaction.query.count(),
                "active_transactions": Transaction.query.filter_by(status="active").count(),
                "completed_transactions": Transaction.query.filter_by(status="completed").count(),
                "total_settlements": Settlement.query.count(),
                "pending_settlements": Settlement.query.filter_by(status="pending").count(),
                "platform_commission": db.session.query(
                    func.sum(Settlement.commission_amount)
                ).filter_by(status="completed").scalar() or 0
            }
        
        return jsonify({
            "success": True,
            "data": stats,
            "message": "Admin statistics retrieved"
        })
    
    @app.route('/admin/create-test-data')
    def create_test_data():
        """Create test data for development"""
        from app.models import User, Customer, Merchant, Branch
        from app.config import Config
        
        with app.app_context():
            # Check if data exists
            if User.query.first():
                return jsonify({
                    "success": False,
                    "message": "Test data already exists"
                })
            
            # Create test customer
            customer_user = User(
                email="customer@test.com",
                full_name="Ahmed Customer",
                phone="+966501111111",
                national_id="1234567890",
                role="customer",
                is_active=True,
                is_verified=True
            )
            customer_user.set_password("password123")
            db.session.add(customer_user)
            db.session.flush()
            
            customer = Customer(
                user_id=customer_user.id,
                credit_limit=Config.DEFAULT_CREDIT_LIMIT,
                available_balance=Config.DEFAULT_CREDIT_LIMIT,
                status="active"
            )
            db.session.add(customer)
            
            # Create test merchant
            merchant_user = User(
                email="merchant@test.com",
                full_name="Mohammed Merchant",
                phone="+966502222222",
                national_id="0987654321",
                role="merchant",
                is_active=True,
                is_verified=True
            )
            merchant_user.set_password("password123")
            db.session.add(merchant_user)
            db.session.flush()
            
            merchant = Merchant(
                user_id=merchant_user.id,
                shop_name="Al-Yusr Electronics",
                shop_name_ar="الكترونيات اليسر",
                city="Riyadh",
                status="active",
                is_verified=True
            )
            db.session.add(merchant)
            db.session.flush()
            
            # Create test branch
            branch = Branch(
                merchant_id=merchant.id,
                name="Main Branch - Olaya",
                city="Riyadh",
                address="Olaya Street",
                is_active=True
            )
            db.session.add(branch)
            
            db.session.commit()
            
            return jsonify({
                "success": True,
                "data": {
                    "customer": {
                        "email": "customer@test.com",
                        "password": "password123",
                        "user_id": customer_user.id,
                        "customer_id": customer.id
                    },
                    "merchant": {
                        "email": "merchant@test.com",
                        "password": "password123",
                        "user_id": merchant_user.id,
                        "merchant_id": merchant.id
                    }
                },
                "message": "Test data created successfully"
            })


def init_database(app: Flask):
    """Initialize database tables"""
    with app.app_context():
        # Import all models
        from app.models import (
            User, Customer, Merchant, Branch,
            PurchaseRequest, Transaction, Payment,
            Settlement, RepaymentPlan, RepaymentSchedule
        )
        from app.models.customer import CustomerLimitHistory
        
        # Create tables
        db.create_all()
        print("✅ Database tables created successfully!")


# Create Flask app instance
flask_app = create_flask_app()
