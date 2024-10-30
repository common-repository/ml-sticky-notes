<?php
/*
 * Plugin Name: ML Sticky Notes
 * Plugin URI: http://www.matchalabs.com
 * Description: Admin sticky notes for front end page and posts
 * Version: 0.1
 * Author: Matcha Labs
 * Author URI: http://www.matchalabs.com
 * License: GPL
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
*/

class MLStickyNotes
{
	public $option_name = 'ml_sticky_notes';

	/**
	 * Constructor
	 */
	public function __construct() {
		if ( is_admin() ) {
			add_action( 'wp_ajax_save-note', array( $this, 'save_note' ) );
		}
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Include the JS
	 */
	public function enqueue_scripts() {
		global $post;

		if (current_user_can( 'manage_options' ) && (is_front_page() || is_page() || is_single())) {
			wp_enqueue_script( 'jquery-drag', plugin_dir_url( __FILE__ ) . '/js/jquery.event.drag-2.2.js', array( 'jquery' ) );
			wp_enqueue_script( 'ml-sticky-notes', plugin_dir_url( __FILE__ ) . '/js/display.js', array( 'jquery' ) );
			wp_localize_script( 'ml-sticky-notes', 'MLStickyNotes', array(
			    'ajaxurl' => admin_url( 'admin-ajax.php' ),
			    'nonce' => wp_create_nonce( 'ml-sticky-notes-nonce' ),
			    'pageid' => $this->get_page_id(),
			    'saved' => $this->get_notes()
			) );
		}
	}

    /**
     * Return page notes (in json format at this stage)
     */
	public function get_notes() {
		$notes = "";
		$page_id = $this->get_page_id();

		if ($page_id >= 0) {
			$option_name = $this->option_name . '_' . $page_id;
			$notes = get_option($option_name);
		}

		return $notes;
	}	

	/**
	 * Return the page ID, taking into account a dynamic front page
	 */
	public function get_page_id() {
		global $post;
		$page_id = $post->ID;

		if (is_front_page()) {
			return 0;
		} else {
			return $page_id;
		}
	}

    /**
     * Save note to options table
     */
	public function save_note() {
		if ( ! isset( $_REQUEST['nonce'] ) || ! wp_verify_nonce( $_REQUEST['nonce'], 'ml-sticky-notes-nonce' ) ) {
			die ('Invalid Nonce');
		}

		$option_name = $this->option_name . '_' . intval($_REQUEST['pageid']);

		$note = $_REQUEST['note']; // array of options

		// get the existing notes for the page, and turn them back into an array of notes
		$notesForPage = json_decode(get_option($option_name), true);

		if ($note['text'] == "") {
			unset($notesForPage[$note['id']]); // note has been deleted, remove from array
		} else {
			$notesForPage[$note['id']] = $note; // add/edit the note to the array of page notes
		}

		// insert json array of all notes for page back into database
		if (get_option($option_name) || get_option($option_name) == "") {
		    update_option($option_name, json_encode($notesForPage));
		} else {
			add_option($option_name, json_encode($notesForPage));
		}

		header( "Content-Type: application/json" );
		echo json_encode($note); // result
		exit;
	}
}

$ml_sticky_notes = new MLStickyNotes();

?>