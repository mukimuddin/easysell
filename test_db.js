const pool = require('./lib/db');

async function test() {
  try {
    const admin_id = 1; // Assuming admin ID 1 exists
    const full_name = "Test Updated " + new Date().getTime();
    
    console.log("Testing update for admin_id:", admin_id);
    
    const query = `
      INSERT INTO employee_details (admin_id, full_name)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)
    `;
    
    const [result] = await pool.execute(query, [admin_id, full_name]);
    console.log("Result:", result);
    
    const [rows] = await pool.query("SELECT * FROM employee_details WHERE admin_id = ?", [admin_id]);
    console.log("Rows after update:", rows);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

test();
