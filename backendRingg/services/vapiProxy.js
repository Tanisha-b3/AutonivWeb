// VapiProxy service is not used in this Ringg standalone backend.
export default (req, res) => res.status(404).json({ message: 'Not found' });
