import React, { useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { green } from "@mui/material/colors";
import {
  doc,
  getDocs,
  collection,
  increment,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { UserContext } from "../App";

function createData(name, link, desc) {
  return { name, link, desc };
}

export default function BasicTable() {
  const { email, setEmail } = useContext(UserContext);
  const [rows, setRows] = useState([]);
  const [uprows, setUpRows] = useState(0);

  useEffect(() => {
    loop();
    rendering();
  }, []);

  const [upvotesData, setUpvotesData] = useState([]);

  const _handleRowHover = (hoveredRow) => setUpRows({ hoveredRow });

  const _renderTableRow = ({ row, hovered }) => {
    return (
      <TableRow
        key={row.name}
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>{row.link}</span>
            <div>
              {upvotesData.includes(row.name) || uprows ? (
                <ArrowCircleUpIcon style={{ color: green[500] }} />
              ) : (
                <ArrowCircleUpIcon
                  onClick={() => {
                    upvoteHandler(row.name);
                  }}
                />
              )}
            </div>
          </div>
        </TableCell>
        <TableCell align="center">{row.desc}</TableCell>
      </TableRow>
    );
  };

  async function rendering() {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    setUpvotesData(docSnap.data().Upvotes);
  }

  let temp = [];

  async function loop() {
    const querySnapshot = await getDocs(collection(db, "table"));
    console.log(querySnapshot);
    querySnapshot.forEach((doc) => {
      temp.push(
        createData(
          doc.data().Name,
          doc.data().Upvotes,
          doc.data().Description[0]
        )
      );
    });
    setRows(temp);
    temp = [];
  }

  const upvoteHandler = async (nameOfArticle) => {
    _handleRowHover();
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data().Upvotes;
    if (!data.includes(nameOfArticle)) {
      await updateDoc(doc(db, "table", nameOfArticle), {
        Upvotes: increment(1),
      });
      loop();
      console.log(email);
      await updateDoc(doc(db, "users", email), {
        Upvotes: arrayUnion(nameOfArticle),
      });
    } else {
      console.log("exists");
    }
  };

  const navigate = useNavigate();

  const gotoAdd = async () => {
    try {
      console.log("Added");
      navigate("/add");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "50%" }}>Article Name</TableCell>
              <TableCell style={{ width: "15%" }} align="center">
                Upvotes
              </TableCell>
              <TableCell style={{ width: "35%" }} align="center">
                Topic
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) =>
              // <TableRow
              //   key={row.name}
              //   sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              // >
              //   <TableCell component="th" scope="row">
              //     {row.name}
              //   </TableCell>
              //   <TableCell align="center">
              //     <div
              //       style={{
              //         display: "flex",
              //         alignItems: "center",
              //       }}
              //     >
              //       <span>{row.link}</span>
              //       <div>
              //         {upvotesData.includes(row.name) ? (
              //           <ArrowCircleUpIcon style={{ color: green[500] }} />
              //         ) : (
              //           <ArrowCircleUpIcon
              //             onClick={() => {
              //               upvoteHandler(row.name);
              //             }}
              //           />
              //         )}
              //       </div>
              //     </div>
              //   </TableCell>
              //   <TableCell align="center">{row.desc}</TableCell>
              // </TableRow>
              _renderTableRow({
                row,
                hovered: index === uprows,
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <button onClick={gotoAdd}> Add an article </button>
    </div>
  );
}
