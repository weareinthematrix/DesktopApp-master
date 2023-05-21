// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
  fn add_row(date : usize, te_sec : String, te_rri : String, ts_sec : String, ts_rri : String, debit_sec : String, debit_rri : String, k : String, e : String, ea : String, me : String) -> bool {
    /*
    We add the date timestamp and all the values
    teSec = parseFloat(inputValues["exp-te-sec"]);
            teRri = parseFloat(inputValues["exp-te-rri"]);
            tsSec = parseFloat(inputValues["exp-ts-sec"]);
            tsRri = parseFloat(inputValues["exp-ts-rri"]);
            debitSec = parseFloat(inputValues["exp-debit-sec"]);
            debitRri = parseFloat(inputValues["exp-debit-rri"]);
    */
    add_row_core(date, te_sec, te_rri, ts_sec, ts_rri, debit_sec, debit_rri, k, e, ea, me).unwrap();
    println!("Row added");
    true
  }
  
  fn add_row_core(date : usize, te_sec : String, te_rri : String, ts_sec : String, ts_rri : String, debit_sec : String, debit_rri : String, k : String, e : String, ea : String, me : String)-> Result<()>{
    let conn = Connection::open("../data/echangeurs.db")?;
    let mut req = format!("CREATE TABLE IF NOT EXISTS mesures (id INTEGER PRIMARY KEY, date INT, te_sec text, te_rri text, ts_sec text, ts_rri text, debit_sec text, debit_rri text, k text, e text, ea text, me text)");
    conn.execute(&req[..], [])?;
    req = format!("INSERT INTO mesures (date, te_sec, te_rri, ts_sec, ts_rri, debit_sec, debit_rri, k, e, ea, me) values ({}, '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')", date, te_sec, te_rri, ts_sec, ts_rri, debit_sec, debit_rri, k, e, ea, me);
    conn.execute(&req[..], [])?;
    Ok(())
  }

  #[derive(Serialize, Deserialize, Debug)]
  struct data_point {
      date:usize,
      val: String
  }

#[tauri::command]
fn get_data(date_min : usize, param : String) -> Vec<Vec<String>>{
    let mut my_vector : Vec<Vec<String>> = vec![];
    let status = match get_data_core(date_min, param, &mut my_vector){
      Ok(()) => println!("Read successfully"),
      Err(e) => println!("{}", e)
    };
    //println!("{:?}", my_vector);
    my_vector
}

fn get_data_core(date_min : usize, param : String, vec : &mut Vec<Vec<String>>)-> Result<()>{
    let conn = Connection::open("../data/echangeurs.db")?;
    let req: String = format!("SELECT date, {} FROM mesures WHERE (date >= {}) ORDER BY date", param, date_min);
    println!("{}", req);
    let mut stmt = conn.prepare(&req[..])?;
    let dp_iter = stmt.query_map([], |row| {
      Ok(data_point  {
          date: row.get(0)?,
          val: row.get(1)?  
      })
    })?;
  
  
    for data_point in dp_iter {
      let d_p = data_point?;
      vec.push([d_p.date.to_string(), d_p.val].to_vec());
    }
    Ok(())
}



fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            add_row,
            get_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
