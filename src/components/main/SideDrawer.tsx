import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import {
	Typography,
	Box,
	Drawer,
	Divider,
	Button,
	TextField,
	Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import ConfirmDialog from "../ConfirmDialog";
import { useDrawer } from "../../context/DrawerContext";
import useDeleteAllNotes from "../../hooks/useDeleteAllNotes";
import { NOTES, useCategory } from "../../context/NotesCategoryProvider";

function SideDrawer() {
	const { handleCategoryChange } = useCategory();
	const { isDrawerOpen, setDrawerIsOpen } = useDrawer();
	const [open, setOpen] = useState(false);

	const handleClose = () => {
		setDrawerIsOpen(false);
	};

	const handleClick = (prop: NOTES) => {
		handleCategoryChange(prop);
		handleClose();
	};

	const handleDialogOpen = () => {
		handleClose();
		setOpen(true);
	};

	return (
		<Fragment>
			<Drawer
				open={isDrawerOpen}
				onClose={handleClose}
				sx={{
					width: 200,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: 200,
						boxSizing: "border-box",
					},
				}}
			>
				<Box>
					<Box>
						<Typography
							textAlign="center"
							fontSize="large"
							fontWeight="bold"
							py="1rem"
						>
							Notes
						</Typography>
					</Box>
					<Divider />
					<Box
						display="flex"
						justifyContent="center"
						alignContent="center"
						marginTop="1rem"
						flexDirection="column"
					>
						<Button
							variant="text"
							fullWidth
							onClick={() => handleClick(NOTES.GENERAL)}
						>
							All Notes
						</Button>
						<Button
							variant="text"
							fullWidth
							onClick={() => handleClick(NOTES.IMPORTANT)}
						>
							Important Notes
						</Button>
						<Box display="flex" justifyContent="center" alignContent="center">
							<Button
								variant="outlined"
								size="medium"
								fullWidth
								sx={{ position: "absolute", bottom: "20px", width: "80%" }}
								onClick={handleDialogOpen}
							>
								Delete All
							</Button>
						</Box>
					</Box>
				</Box>
			</Drawer>
			<DeleteAllNotesConfirmDialog
				open={open}
				setOpen={setOpen}
				handleClose={handleClose}
			/>
		</Fragment>
	);
}

export default SideDrawer;

function DeleteAllNotesConfirmDialog({
	handleClose,
	open,
	setOpen,
}: {
	handleClose: () => void;
	setOpen: (prop: boolean) => void;
	open: boolean;
}) {
	const [deleteAllNote, loading, error, setError] = useDeleteAllNotes();
	const [input, setInput] = useState("");
	const [deleteText] = useState("Delete");

	const handleDeleteAll = async () => {
		handleClose();
		await deleteAllNote();
	};

	const OnPositiveButtonPress = () => {
		handleDialogClose();
		handleDeleteAll();
	};

	const handleDialogClose = () => {
		setOpen(false);
	};

	return (
		<Fragment>
			<ConfirmDialog
				title="Delete all notes ?"
				message="This action is permanent, 
        after deleting all notes you cannot recover it."
				open={open}
				handleClose={() => {
					setInput("");
					handleDialogClose();
				}}
				positiveButtonLabel="Delete"
				onPositiveButtonPress={OnPositiveButtonPress}
				positiveButtonProps={{
					variant: "contained",
					color: "error",
					disableElevation: true,
					startIcon: <DeleteIcon />,
					disabled: input !== deleteText,
					loading: loading,
					loadingPosition: "start",
				}}
			>
				<Typography>
					Please type <strong>{deleteText}</strong> to confirm.
				</Typography>
				<TextField
					value={input}
					variant="outlined"
					onChange={(e) => setInput(e.target.value)}
				/>
			</ConfirmDialog>
			<Snackbar
				open={Boolean(error)}
				message={error}
				onClose={() => {
					setError(null);
				}}
			/>
		</Fragment>
	);
}
