import { Card, Col, Row } from 'react-bootstrap';

function DashboardStats({ stats }) {
  return (
    <Row className="mb-5 g-3">
      <Col md={6}>
        <Card className="h-100 shadow-sm border-primary">
          <Card.Body className="text-center">
            <Card.Title>Cards Due Today</Card.Title>
            <Card.Text className="display-4 fw-bold text-primary">
              {stats?.cardsDue ?? 'N/A'}
            </Card.Text>
            <Card.Text className="text-muted">Cards to review today</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card className="h-100 shadow-sm border-success">
          <Card.Body className="text-center">
            <Card.Title>Cards Reviewed</Card.Title>
            <Card.Text className="display-4 fw-bold text-success">
              {stats?.cardsReviewed ?? 'N/A'}
            </Card.Text>
            <Card.Text className="text-muted">Total cards mastered</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default DashboardStats;
