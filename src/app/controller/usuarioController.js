const login = (req, res) => {
    const { usuario, password } = req.body;
  
    if (usuario === 'admin' && password === '1234') {
      req.session.usuario = { nombre: 'Admin general', rol: 'admin' };
      return res.redirect('/dashboard');
    }
  
    res.status(401).render('users', { error: 'Credenciales incorrectas' });
  };
  
  const logout = (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  };
  
  const vistaLogin = (req, res) => res.render('users');
  
  module.exports = {
    login,
    logout,
    vistaLogin
  };
  