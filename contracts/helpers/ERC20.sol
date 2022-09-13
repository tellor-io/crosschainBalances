// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;


contract ERC20 { 
    
    string public name;
    string public symbol;
    uint public decimals;

    uint _totalSupply;

    mapping(address => uint) internal _balances;
    mapping(address => mapping(address => uint)) internal _allowance;
    
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    /** @dev Contract constructor
      * @param _cap The token supply cap
      * @param _name The name of the token 
      * @param _symbol The symbol of the token
      * @param _decimals The decimals of the token
      */

    constructor(uint _cap, string memory _name, string memory _symbol, uint _decimals) public {
        _balances[msg.sender] = _cap;
        _totalSupply = _cap;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        emit Transfer(address(0x0), msg.sender, _cap);
    }

    function totalSupply() external view returns (uint) {
        return _totalSupply;
    }

    function balanceOf(address tokenOwner) external view returns (uint balance) { 
      return _balances[tokenOwner];
    }
    
    function allowance(address tokenOwner, address spender) external view returns (uint remaining) {
        return _allowance[tokenOwner][spender];
    }
    
    function transfer(address to, uint tokens) external returns (bool success) {
        require(_balances[msg.sender] >= tokens);
        _balances[msg.sender] -= tokens;
        _balances[to] += tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
    
    function approve(address spender, uint tokens) external returns (bool success) {
        _allowance[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
    function transferFrom(address from, address to, uint tokens) external returns (bool success) {
        require(_allowance[from][msg.sender] >= tokens);
        require(_balances[from] >= tokens);
        _allowance[from][msg.sender] -= tokens;
        _balances[from] -= tokens;
        _balances[to] += tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

}
