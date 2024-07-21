import './Featured.scss'
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import { CircularProgressbar } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';

const Featured = () => {
  return (
    <div className='featured'>
      <div className='top'>
        <h1 className="title">Total Revenue</h1>
        <MoreVertOutlinedIcon fontSize='small' />
      </div>
      <div className='bottom'>
        <div className="featuredChart">
        <CircularProgressbar value={70} text={'70%'} strokeWidth={5}/>
        </div>
        <p className="title">Total made today</p>
        <p className="number">40</p>
        <p className="desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
        </p>
        <div className="summary">
          <div className="item">
            <div className='itemTitle'>Target</div>
            <div className='itemResult positive'>
              <KeyboardArrowUpOutlinedIcon fontSize='small' />
              <div className="resultAmount">12.1</div>
            </div>
          </div>
          <div className="item">
            <div className='itemTitle'>Last Week</div>
            <div className='itemResult positive'>
              <KeyboardArrowUpOutlinedIcon fontSize='small' />
              <div className="resultAmount">12.1</div>
            </div>
          </div>
          <div className="item">
            <div className='itemTitle'>Last Month</div>
            <div className='itemResult negative'>
              <KeyboardArrowDownOutlinedIcon fontSize='small' />
              <div className="resultAmount">12.1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;