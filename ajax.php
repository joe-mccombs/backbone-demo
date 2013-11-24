<?php
/**
 * Main processor for handling ajax calls. 
 *
 * NOTE: In the interest of time, this "contoller" is very procedural. If there
 * was potential for this application to be more than it is, it'd make sense
 * to create real controllers/actions for code maintainability.
 */



/**
 * Simple error handler for always returning JSON results
 */
function error_handler($errno, $errstr, $errfile, $errline)
{
	echo json_encode(array(
		"success" => false,
		"message" => $errstr
	));
	exit(-1);
}
set_error_handler('error_handler');


/**
 * Every action requires a database connection, so initialize now.
 *
 * NOTE: I thought about putting encrypted DB credentials in an .ini file; but,
 * since this is a standalone demo application, and in the interest of simplicity,
 * I decided to minimize file dependancies
 */
$dbh = new PDO('mysql:dbname=taulia;host=localhost', 'root', '');


$var = json_decode(file_get_contents('php://input'), true); 

switch ($_SERVER['REQUEST_METHOD']) {
	case 'POST':
	case 'PUT':
		//@TODO: Do server-side validation (incase javascript was circumvented).  Scrubbing
		//would be nice too; at the least to prevent XSS/script injection
		$values = array(
			':email' => $var['email'],
			':first_name' => $var['first'],
			':last_name' => $var['last'],
			':prefix' => $var['prefix'],
			':phone' => $var['phone'],
			':fax' => $var['fax'],
			':title' => $var['title'],
			':company' => $var['company'],
			':company_url' => $var['url'],
		);
		
		//@TODO: id should at the very least be masked for hacking reasons.
		if (isset($var['id'])) {
			$sql = "
				UPDATE `customer` SET 
					`email` = :email, 
					`first_name` = :first_name, 
					`last_name` = :last_name, 
					`prefix` = :prefix, 
					`phone` = :phone, 
					`fax` = :fax, 
					`title` = :title, 
					`company` = :company, 
					`company_url` = :company_url
				WHERE `id` = :id
			";
			$values[':id'] = $var['id'];
		} else {
			$sql = "
				INSERT INTO `customer` 
					(`email`, `first_name`, `last_name`, `prefix`, `phone`, `fax`, `title`, `company`, `company_url`)
				VALUES
					(:email, :first_name, :last_name, :prefix, :phone, :fax, :title, :company, :company_url)
			";
		}
		
		$stmt = $dbh->prepare($sql);
		
		if ($stmt->execute($values)) {
			echo json_encode(array(
				"success" => true,
				"message" => "Customer has been added/updated."
			));
			exit(0);
		}
		break;
		
	case 'DELETE':
		$sql = "DELETE FROM `customer` WHERE `id` = :id";
		$values = array(':id' => $_REQUEST['id']);
		
		$stmt = $dbh->prepare($sql);
		
		if ($stmt->execute($values)) {
			echo json_encode(array(
				"success" => true,
				"message" => "Customer has been deleted."
			));
			exit(0);
		}
		break;
		

		
	/**
	 *  Handle fetch() for pulling down rows
	 */
	case 'GET':
	
		//sortBy is the only variable passed directly into the SQL from the 
		//user.  Because of that, I am doing a crude scrub to prevent sql
		//injection (otherwise, DB binding is sufficient at preventing SQL injection)
		$sortBy = preg_replace('/[^a-z]/', '', $_REQUEST['sortBy']);
		$sortDir = ((int)$_REQUEST['sortDir'] > 0) ? 'ASC' : 'DESC';
		$page = (int)$_REQUEST['page'];
		$limit = (int)$_REQUEST['limit'];
	
		$sql = "
			SELECT SQL_CALC_FOUND_ROWS 
				`id`, `email`, `first_name` AS `first`, `last_name` AS `last`, `prefix`, 
				`phone`, `fax`, `title`, `company`, `company_url` AS `url`
			FROM `customer`
			ORDER BY $sortBy $sortDir
			LIMIT " . (($page-1) * $limit) . ", $limit
		";
		
		$stmt = $dbh->prepare($sql);
		$stmt->execute();
		$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
				
		$rowCount = $dbh->query('SELECT FOUND_ROWS()'); 
		$rowCount = (int)$rowCount->fetchColumn(); 
		
		echo json_encode(array(
			"count" => $rowCount,
			"page" => $_REQUEST['page'],
			"data" => $rows
		));
		exit(0);
		break;
}



error_handler(0, "Invalid ajax request, or action failed.", '', '');

