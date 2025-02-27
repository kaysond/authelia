package regulation

import "fmt"

// ErrUserIsBanned user is banned error message.
var ErrUserIsBanned = fmt.Errorf("user is banned")

const (
	// AuthType1FA is the string representing an auth log for first-factor authentication.
	AuthType1FA = "1FA"

	// AuthTypeTOTP is the string representing an auth log for second-factor authentication via TOTP.
	AuthTypeTOTP = "TOTP"

	// AuthTypeFIDO is the string representing an auth log for second-factor authentication via FIDO/CTAP1/U2F.
	AuthTypeFIDO = "FIDO"

	// AuthTypeFIDO2 is the string representing an auth log for second-factor authentication via FIDO2/CTAP2/Webauthn.
	// TODO: Add FIDO2.

	// AuthTypeDUO is the string representing an auth log for second-factor authentication via DUO.
	AuthTypeDUO = "DUO"
)
