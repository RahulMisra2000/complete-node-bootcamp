// Whoever calls this function will call it with a single parameter which is a function
module.exports = (fn) => {              
  return (req, res, next) => {
    fn(req, res, next).catch(next);       // The function fn better return a promise
  };
};
