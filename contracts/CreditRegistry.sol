// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CreditRegistry
/// @notice One evidence fingerprint can back one carbon credit. A second mint reverts.
///         The contract does not read documents and does not trust a model. Callers
///         bring a bytes32 they already computed. Status moves Issued → Retired or Contested.
contract CreditRegistry {
    enum Status {
        None,
        Issued,
        Retired,
        Contested
    }

    struct Credit {
        bytes32 evidenceHash;
        string uri;
        address issuer;
        Status status;
        uint64 issuedAt;
    }

    uint256 public nextId;

    mapping(uint256 => Credit) private _credits;
    mapping(bytes32 => uint256) public evidenceHashToCreditId;

    error EVIDENCE_ALREADY_USED(bytes32 evidenceHash, uint256 creditId);
    error EMPTY_EVIDENCE();
    error EMPTY_URI();
    error CREDIT_NOT_FOUND(uint256 creditId);
    error NOT_ISSUER(uint256 creditId, address caller);
    error CREDIT_NOT_ISSUED(uint256 creditId, Status status);

    event CreditMinted(
        uint256 indexed creditId,
        bytes32 indexed evidenceHash,
        address indexed issuer,
        string uri
    );
    event CreditRetired(uint256 indexed creditId, address indexed by);
    event CreditContested(uint256 indexed creditId, address indexed by, string reason);

    function mint(bytes32 evidenceHash, string calldata uri) external returns (uint256 creditId) {
        if (evidenceHash == bytes32(0)) revert EMPTY_EVIDENCE();
        if (bytes(uri).length == 0) revert EMPTY_URI();

        uint256 existing = evidenceHashToCreditId[evidenceHash];
        if (existing != 0) revert EVIDENCE_ALREADY_USED(evidenceHash, existing);

        creditId = ++nextId;
        _credits[creditId] = Credit({
            evidenceHash: evidenceHash,
            uri: uri,
            issuer: msg.sender,
            status: Status.Issued,
            issuedAt: uint64(block.timestamp)
        });
        evidenceHashToCreditId[evidenceHash] = creditId;

        emit CreditMinted(creditId, evidenceHash, msg.sender, uri);
    }

    function retire(uint256 creditId) external {
        Credit storage credit = _loadIssued(creditId);
        if (credit.issuer != msg.sender) revert NOT_ISSUER(creditId, msg.sender);
        credit.status = Status.Retired;
        emit CreditRetired(creditId, msg.sender);
    }

    /// @notice Anyone may contest an issued credit. The credit stays on the registry, marked Contested.
    function contest(uint256 creditId, string calldata reason) external {
        Credit storage credit = _loadIssued(creditId);
        credit.status = Status.Contested;
        emit CreditContested(creditId, msg.sender, reason);
    }

    function getCredit(uint256 creditId) external view returns (Credit memory) {
        return _credits[creditId];
    }

    /// @notice Returns 0 when the fingerprint has never been minted.
    function creditIdForEvidence(bytes32 evidenceHash) external view returns (uint256) {
        return evidenceHashToCreditId[evidenceHash];
    }

    function _loadIssued(uint256 creditId) private view returns (Credit storage credit) {
        credit = _credits[creditId];
        if (credit.status == Status.None) revert CREDIT_NOT_FOUND(creditId);
        if (credit.status != Status.Issued) revert CREDIT_NOT_ISSUED(creditId, credit.status);
    }
}
