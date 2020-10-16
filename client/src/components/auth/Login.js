import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions/auth';
import PropTypes from 'prop-types'
import auth from '../../reducers/auth';

const Login = ({ login,isAuthenticated}) => {

    const [formData, setFormData] = useState({
        
        email: '',
        password: '',
        
    });

    const {  email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        
        login(email,password)
        

    };

    if(isAuthenticated){
        return <Redirect to='/dashboard'/>
    };
    return (
        <div>
            <h1 className="large text-primary">Sign In</h1>
            <p className="lead"><i class="fas fa-user"></i> Sign In Your Account</p>
            <form className="form" onSubmit={onSubmit}>
                
                <div className="form-group">
                    <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} />
                    <small className="form-text"
                    >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
                    >
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                        value={password} onChange={onChange}
                    />
                </div>
                
                <input type="submit" class="btn btn-primary" value="Log In" />
            </form>
            <p className="my-1">
                Dont have an account? <Link to="/register">Sign Up</Link>
            </p>
        </div>
    );
};

Login.propTypes={
    login:PropTypes.func.isRequired,
    isAuthenticated:PropTypes.bool,
};

const mapStateToProps=state=>({
    isAuthenticated:state.auth.isAuthenticated
})

export default connect(mapStateToProps,{ login})(Login);